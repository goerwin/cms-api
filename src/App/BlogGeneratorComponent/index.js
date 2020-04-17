const express = require('express');

function getRouter({
    userModel,
    domainModel,
    categoryModel,
    tagModel,
    templateModel,
    assetModel,
    postModel,
}) {
    const routerEl = express.Router();

    routerEl.get('/getDomainsFullData/:domainName', (req, res) => {
        const { domainName } = req.params;

        domainModel
            .findOne({ name: domainName })
            .select('name')
            .then((domain) =>
                Promise.all([domain, postModel.find({ domain: domain._id })])
            )
            .then(([domain, domainPosts]) => {
                const promiseDomainPosts = domainPosts.map((domainPost) => {
                    const promiseUser = userModel
                        .findById(domainPost.user)
                        .select('username email name');

                    const promiseTags = Promise.all(
                        (domainPost.tags || []).map((el) =>
                            tagModel.findById(el)
                        )
                    );

                    const promiseCategory = categoryModel.findById(
                        domainPost.category
                    );
                    const promiseTemplate = templateModel.findById(
                        domainPost.template
                    );
                    const promiseAssets = Promise.all(
                        (domainPost.assets || []).map((el) =>
                            assetModel.findById(el)
                        )
                    );

                    return Promise.all([
                        domainPost,
                        domain,
                        promiseUser,
                        promiseTags,
                        promiseCategory,
                        promiseTemplate,
                        promiseAssets,
                    ]);
                });

                return Promise.all(promiseDomainPosts);
            })
            .then((domainPosts) => {
                res.json(
                    domainPosts.map(
                        ([
                            post,
                            domain,
                            user,
                            tags,
                            category,
                            template,
                            assets,
                        ]) => ({
                            ...post.toObject(),
                            domain,
                            user,
                            tags,
                            category,
                            template,
                            assets,
                        })
                    )
                );
            })
            .catch((err) => res.status(500).json(err.message));
    });

    return routerEl;
}

module.exports = function index(params) {
    return {
        blogGeneratorRouter: getRouter(params),
    };
};
