const domainApiUrl = '/api/domains';
const domainPropsToCheck = ['name'];
const domainPropsToExpect = ['_id', 'createdAt', 'name', 'updatedAt'];

const badDataToPostPatchDomains = [
  { name: 'shor' },
  { name: 'has space' },
  { name: 'has-dash' },
  { name: 'has$pecialChars' },
];

const badDataToPatchDomains = [{ name: 'eee' }];

const goodDataToPostPatchDomains = [
  { name: 'name1' },
  { name: 'name2ha' },
  { name: 'name3go' },
  { name: 'name4erwin' },
];

const goodDataToPatchDomains = [{ name: 'patch1' }, { name: 'patch2' }];

it.todo('TODO');

module.exports = {
  domainApiUrl,
  domainPropsToCheck,
  domainPropsToExpect,
  badDataToPostPatchDomains,
  badDataToPatchDomains,
  goodDataToPostPatchDomains,
  goodDataToPatchDomains,
};
