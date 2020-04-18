const { program } = require('commander');
const path = require('path');
const helpers = require('./helpers');
const fsExtra = require('fs-extra');

program
    .requiredOption(
        '-i, --inputDirectory <dir>',
        'Blog directory with the Markdown files'
    )
    .option(
        '-o, --outputDirectory <dir>',
        'Output directory with generated files'
    );

program.parse(process.argv);

console.log('Creating blog...');

helpers
    .generateBlogFileStructureFromDir(path.join(program.inputDirectory))
    .then((blogFileStructure) => {
        const outputDirectory = path.resolve(
            program.outputDirectory
                ? program.outputDirectory
                : program.inputDirectory,
            '__generatedBlog__'
        );

        fsExtra.removeSync(outputDirectory);

        Object.keys(blogFileStructure).forEach((key) => {
            fsExtra.outputFileSync(
                path.join(outputDirectory, key),
                blogFileStructure[key],
                'utf8'
            );
        });

        console.log('Blog generated at', outputDirectory);
    });
