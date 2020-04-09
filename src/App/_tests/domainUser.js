const { strictEqual, deepStrictEqual } = require('assert');
const {
    supertestSeries,
    stf,
    items,
    beforeEachApp,
    beforeEachWithAdminCookieApp,
} = require('./_helpers');

const {
    domainApiUrl,
    badDataToPatchDomains,
    badDataToPostPatchDomains,
    domainPropsToCheck,
    domainPropsToExpect,
    goodDataToPostPatchDomains,
    goodDataToPatchDomains,
} = require('./domain');

const {
    userApiUrl,
    badDataToPatchUsers,
    badDataToPostPatchUsers,
    goodDataToPatchUsers,
    goodDataToPostPatchUsers,
    userPropsToCheck,
    userPropsToExpect,
} = require('./user');

describe('Domains and Users', () => {
    beforeEach(beforeEachApp);

    describe('With No or wrong Cookie AdminKey', () => {
        describe.each`
            requestType
            ${'get'}
            ${'post'}
            ${'patch'}
            ${'delete'}
        `('$requestType', ({ requestType }) => {
            describe.each`
                name         | apiUrl
                ${'Domains'} | ${domainApiUrl}
                ${'Users'}   | ${userApiUrl}
            `('$name', ({ name, apiUrl }) => {
                it(`should return a 401 if no cookie adminKey in ${name} ${requestType}`, (done) => {
                    items.app[requestType](apiUrl)
                        .expect(401)
                        .then(() => done());
                });

                it(`should return a 401 when wrong cookie adminKey in ${name} ${requestType}`, (done) => {
                    items.app[requestType](apiUrl)
                        .set('Cookie', ['adminKey=aBADRandomSecretAdminKey;'])
                        .expect(401)
                        .then(() => done());
                });
            });
        });
    });

    describe('With Cookie AdminKey', () => {
        beforeEach(beforeEachWithAdminCookieApp);

        describe.each`
            name        | apiUrl          | data                             | propsToCheck          | propsToExpect
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPostPatchDomains[1]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPostPatchDomains[2]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPostPatchDomains[3]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers[1]}   | ${userPropsToCheck}   | ${userPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers[2]}   | ${userPropsToCheck}   | ${userPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers[3]}   | ${userPropsToCheck}   | ${userPropsToExpect}
        `(
            'POST $name',
            ({ name, apiUrl, data, propsToCheck, propsToExpect }) => {
                it(
                    `should POST a ${name} with data ${stf(data)} ` +
                        'and return expected props',
                    (done) => {
                        items.withAdminCookieApp
                            .post(apiUrl)
                            .send(data)
                            .expect(200)
                            .then((results) => {
                                strictEqual(
                                    propsToCheck.every(
                                        (el) => results.body[el] === data[el]
                                    ),
                                    true
                                );
                                deepStrictEqual(
                                    Object.keys(results.body).sort(),
                                    propsToExpect
                                );
                            })
                            .then(() => done());
                    }
                );
            }
        );

        describe.each`
            name        | apiUrl          | badData
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[0]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[1]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[2]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[3]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[1]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[2]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[3]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[4]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[5]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[6]}
        `('Bad POST $name', ({ name, apiUrl, badData }) => {
            it(`should fail to POST ${name} with bad post data: ${stf(
                badData
            )}`, (done) => {
                items.withAdminCookieApp
                    .post(apiUrl)
                    .send(badData)
                    .expect(400)
                    .then(() => done());
            });
        });

        describe.each`
            name        | apiUrl          | data                             | dataToPost                       | propsToCheck          | propsToExpect
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPostPatchDomains[0]} | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPostPatchDomains[1]} | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPatchDomains[0]}     | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Domain'} | ${domainApiUrl} | ${goodDataToPatchDomains[1]}     | ${goodDataToPostPatchDomains[0]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers[0]}   | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers[1]}   | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPatchUsers[0]}       | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
            ${'User'}   | ${userApiUrl}   | ${goodDataToPatchUsers[1]}       | ${goodDataToPostPatchUsers[0]}   | ${userPropsToCheck}   | ${userPropsToExpect}
        `(
            'PATCH $name',
            ({
                name,
                apiUrl,
                data,
                dataToPost,
                propsToCheck,
                propsToExpect,
            }) => {
                it(
                    `should PATCH a ${name} with data ${stf(data)} ` +
                        'and return expected props',
                    (done) => {
                        let entryId;

                        supertestSeries([
                            () =>
                                items.withAdminCookieApp
                                    .post(apiUrl)
                                    .send(dataToPost)
                                    .then((results) => {
                                        entryId = results.body._id;
                                    }),
                            () =>
                                items.withAdminCookieApp
                                    .patch(apiUrl + '/' + entryId)
                                    .send(data)
                                    .expect(200)
                                    .then((results) => {
                                        strictEqual(
                                            propsToCheck.every(
                                                (el) =>
                                                    results.body[el] ===
                                                    { ...dataToPost, ...data }[
                                                        el
                                                    ]
                                            ),
                                            true
                                        );
                                        deepStrictEqual(
                                            Object.keys(results.body).sort(),
                                            propsToExpect
                                        );
                                    }),
                        ]).then(() => done());
                    }
                );
            }
        );

        describe.each`
            name        | apiUrl          | badData                         | goodData
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[0]} | ${goodDataToPostPatchDomains[0]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[1]} | ${goodDataToPostPatchDomains[0]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[2]} | ${goodDataToPostPatchDomains[0]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPostPatchDomains[3]} | ${goodDataToPostPatchDomains[0]}
            ${'Domain'} | ${domainApiUrl} | ${badDataToPatchDomains[0]}     | ${goodDataToPostPatchDomains[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPatchUsers[0]}       | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPatchUsers[1]}       | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[0]}   | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[1]}   | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[2]}   | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[3]}   | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[4]}   | ${goodDataToPostPatchUsers[0]}
            ${'User'}   | ${userApiUrl}   | ${badDataToPostPatchUsers[5]}   | ${goodDataToPostPatchUsers[0]}
        `('Bad PATCH $name', ({ name, apiUrl, badData, goodData }) => {
            it(`should fail to PATCH ${name} with bad patch data: ${stf(
                badData
            )}`, (done) => {
                let entryId;

                supertestSeries([
                    () => items.withAdminCookieApp.post(apiUrl).send(goodData),
                    () =>
                        items.withAdminCookieApp.get(apiUrl).then((results) => {
                            entryId = results.body[0]._id;
                        }),
                    () =>
                        items.withAdminCookieApp
                            .patch(apiUrl + '/' + entryId)
                            .send(badData)
                            .expect(400),
                ]).then(() => done());
            });
        });

        describe.each`
            name         | apiUrl          | dummyEntries                              | goodNewData                      | propsToCheck          | propsToExpect
            ${'Domains'} | ${domainApiUrl} | ${goodDataToPostPatchDomains.slice(0, 2)} | ${goodDataToPostPatchDomains[3]} | ${domainPropsToCheck} | ${domainPropsToExpect}
            ${'Users'}   | ${userApiUrl}   | ${goodDataToPostPatchUsers.slice(0, 2)}   | ${goodDataToPostPatchUsers[3]}   | ${userPropsToCheck}   | ${userPropsToExpect}
        `(
            'With 2 $name entries',
            ({
                name,
                apiUrl,
                dummyEntries,
                goodNewData,
                propsToCheck,
                propsToExpect,
            }) => {
                let firstEntryId;
                let originalEntriesLen;

                beforeEach(() => {
                    return supertestSeries([
                        () =>
                            items.withAdminCookieApp
                                .post(apiUrl)
                                .send(dummyEntries[0]),
                        () =>
                            items.withAdminCookieApp
                                .post(apiUrl)
                                .send(dummyEntries[1]),
                        () =>
                            items.withAdminCookieApp
                                .get(apiUrl)
                                .then((results) => {
                                    firstEntryId = results.body[0]._id;
                                    originalEntriesLen = results.body.length;
                                }),
                    ]);
                });

                it(`should GET first ${name} entry with expected props`, (done) => {
                    items.withAdminCookieApp
                        .get(apiUrl + '/' + firstEntryId)
                        .expect(200)
                        .then((results) => {
                            deepStrictEqual(
                                Object.keys(results.body).sort(),
                                propsToExpect
                            );

                            strictEqual(
                                propsToCheck.every(
                                    (el) =>
                                        results.body[el] === dummyEntries[0][el]
                                ),
                                true
                            );
                        })
                        .then(() => done());
                });

                it(`should GET 2 ${name} entries with expected props`, (done) => {
                    items.withAdminCookieApp
                        .get(apiUrl)
                        .then((results) => {
                            strictEqual(results.body.length, 2);
                            deepStrictEqual(
                                Object.keys(results.body[0]).sort(),
                                propsToExpect
                            );

                            strictEqual(
                                propsToCheck.every(
                                    (el) =>
                                        results.body[0][el] ===
                                            dummyEntries[0][el] &&
                                        results.body[1][el] ===
                                            dummyEntries[1][el]
                                ),
                                true
                            );
                        })
                        .then(() => done());
                });

                it(`should DELETE the first entry from ${name} and return expected props`, (done) => {
                    items.withAdminCookieApp
                        .delete(apiUrl + '/' + firstEntryId)
                        .expect(200)
                        .then((results) => {
                            deepStrictEqual(
                                Object.keys(results.body).sort(),
                                propsToExpect
                            );

                            strictEqual(
                                propsToCheck.every(
                                    (el) =>
                                        results.body[el] === dummyEntries[0][el]
                                ),
                                true
                            );
                        })
                        .then(() => done());
                });

                it(`should DELETE the first entry from ${name} and GET new ${name} length`, (done) => {
                    supertestSeries([
                        () =>
                            items.withAdminCookieApp.delete(
                                apiUrl + '/' + firstEntryId
                            ),
                        () =>
                            items.withAdminCookieApp
                                .get(apiUrl)
                                .then((results) => {
                                    strictEqual(
                                        results.body.length,
                                        originalEntriesLen - 1
                                    );
                                }),
                    ]).then(() => done());
                });

                it(`should POST a new entry for ${name} and GET new ${name} length`, (done) => {
                    supertestSeries([
                        () =>
                            items.withAdminCookieApp
                                .post(apiUrl)
                                .send(goodNewData),
                        () =>
                            items.withAdminCookieApp
                                .get(apiUrl)
                                .then((results) => {
                                    strictEqual(
                                        results.body.length,
                                        originalEntriesLen + 1
                                    );
                                }),
                    ]).then(() => done());
                });
            }
        );

        it('should POST a user with no domains, return [] domains and also GET [] domains', (done) => {
            supertestSeries([
                () =>
                    items.withAdminCookieApp
                        .post(userApiUrl)
                        .send(goodDataToPostPatchUsers[0])
                        .then((results) => {
                            deepStrictEqual(results.body.domains, []);
                        }),
                () =>
                    items.withAdminCookieApp.get(userApiUrl).then((results) => {
                        deepStrictEqual(results.body[0].domains, []);
                    }),
            ]).then(() => done());
        });

        it(
            'should POST a domain, POST a user with that domain, ' +
                'return it in response and also in GET/id and GET Users',
            (done) => {
                let domainId;
                let userId;

                supertestSeries([
                    () =>
                        items.withAdminCookieApp
                            .post(domainApiUrl)
                            .send(goodDataToPostPatchDomains[0])
                            .then((results) => (domainId = results.body._id)),
                    () =>
                        items.withAdminCookieApp
                            .post(userApiUrl)
                            .send({
                                ...goodDataToPostPatchUsers[0],
                                domains: [domainId],
                            })
                            .then((results) => {
                                userId = results.body._id;
                                deepStrictEqual(results.body.domains, [
                                    domainId,
                                ]);
                            }),
                    () =>
                        items.withAdminCookieApp
                            .get(`${userApiUrl}/${userId}`)
                            .then((results) => {
                                deepStrictEqual(results.body.domains, [
                                    domainId,
                                ]);
                            }),
                    () =>
                        items.withAdminCookieApp
                            .get(userApiUrl)
                            .then((results) => {
                                deepStrictEqual(results.body[0].domains, [
                                    domainId,
                                ]);
                            }),
                ]).then(() => done());
            }
        );
    });
});
