const userApiUrl = '/api/users';
const userPropsToCheck = ['email', 'username'];
const userPropsToExpect = [
  '_id',
  'createdAt',
  'domains',
  'email',
  'updatedAt',
  'username',
];

const badDataToPostPatchUsers = [
  { username: 'shor', email: 'a1@a1.com', password: '12345' },
  { username: 'has space', email: 'a2@a2.com', password: '12345' },
  { username: 'has-dash', email: 'a3@a3.com', password: '12345' },
  { username: 'has$€', email: 'a4@a4.com', password: '12345' },
  { username: 'bademail', email: 'gmail.com', password: '12345' },
  {
    username: 'baddomain',
    email: 'a5@a5.com',
    password: '12345',
    domains: '123456',
  },
  { username: 'badpassword', email: 'a6@a6.com', password: '1234' },
];

const badDataToPatchUsers = [{ email: 'a1.com' }, { password: '1234' }];

const goodDataToPostPatchUsers = [
  { username: 'name1', email: 'a1@a1.com', password: '12345' },
  { username: 'name2ha', email: 'a2@a2.com', password: '12345' },
  { username: 'name3go', email: 'a3@a3.com', password: '12345' },
  { username: 'name4erwin', email: 'a4@a4.com', password: '12345' },
];

const goodDataToPatchUsers = [
  { email: 'patch1@patch1.com' },
  { password: '12345' },
];

it.todo('TODO');

module.exports = {
  userApiUrl,
  userPropsToCheck,
  userPropsToExpect,
  badDataToPostPatchUsers,
  badDataToPatchUsers,
  goodDataToPostPatchUsers,
  goodDataToPatchUsers,
};
