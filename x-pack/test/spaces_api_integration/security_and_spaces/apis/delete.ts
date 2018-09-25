/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { AUTHENTICATION } from '../../common/lib/authentication';
import { SPACES } from '../../common/lib/spaces';
import { TestInvoker } from '../../common/lib/types';
import { deleteTestSuiteFactory } from '../../common/suites/delete';

// tslint:disable:no-default-export
export default function deleteSpaceTestSuite({ getService }: TestInvoker) {
  const supertestWithoutAuth = getService('supertestWithoutAuth');
  const esArchiver = getService('esArchiver');

  const {
    deleteTest,
    createExpectLegacyForbidden,
    expectRbacForbidden,
    expectEmptyResult,
    expectNotFound,
    expectReservedSpaceResult,
  } = deleteTestSuiteFactory(esArchiver, supertestWithoutAuth);

  describe('delete', () => {
    [
      {
        spaceId: SPACES.DEFAULT.spaceId,
        users: {
          noAccess: AUTHENTICATION.NOT_A_KIBANA_USER,
          superuser: AUTHENTICATION.SUPERUSER,
          allGlobally: AUTHENTICATION.KIBANA_RBAC_USER,
          readGlobally: AUTHENTICATION.KIBANA_RBAC_DASHBOARD_ONLY_USER,
          allAtSpace: AUTHENTICATION.KIBANA_RBAC_DEFAULT_SPACE_ALL_USER,
          legacyAll: AUTHENTICATION.KIBANA_LEGACY_USER,
          legacyRead: AUTHENTICATION.KIBANA_LEGACY_DASHBOARD_ONLY_USER,
          dualAll: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_USER,
          dualRead: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_DASHBOARD_ONLY_USER,
        },
      },
      {
        spaceId: SPACES.SPACE_1.spaceId,
        users: {
          noAccess: AUTHENTICATION.NOT_A_KIBANA_USER,
          superuser: AUTHENTICATION.SUPERUSER,
          allGlobally: AUTHENTICATION.KIBANA_RBAC_USER,
          readGlobally: AUTHENTICATION.KIBANA_RBAC_DASHBOARD_ONLY_USER,
          allAtSpace: AUTHENTICATION.KIBANA_RBAC_SPACE_1_ALL_USER,
          legacyAll: AUTHENTICATION.KIBANA_LEGACY_USER,
          legacyRead: AUTHENTICATION.KIBANA_LEGACY_DASHBOARD_ONLY_USER,
          dualAll: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_USER,
          dualRead: AUTHENTICATION.KIBANA_DUAL_PRIVILEGES_DASHBOARD_ONLY_USER,
        },
      },
    ].forEach(scenario => {
      deleteTest(`user with no access from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.noAccess.USERNAME,
          password: scenario.users.noAccess.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 403,
            response: createExpectLegacyForbidden(scenario.users.noAccess.USERNAME, 'read/get'),
          },
          reservedSpace: {
            statusCode: 403,
            response: createExpectLegacyForbidden(scenario.users.noAccess.USERNAME, 'read/get'),
          },
          doesntExist: {
            statusCode: 403,
            response: createExpectLegacyForbidden(scenario.users.noAccess.USERNAME, 'read/get'),
          },
        },
      });

      deleteTest(`superuser from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.superuser.USERNAME,
          password: scenario.users.superuser.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 204,
            response: expectEmptyResult,
          },
          reservedSpace: {
            statusCode: 400,
            response: expectReservedSpaceResult,
          },
          doesntExist: {
            statusCode: 404,
            response: expectNotFound,
          },
        },
      });

      deleteTest(`rbac user with all globally from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.allGlobally.USERNAME,
          password: scenario.users.allGlobally.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 204,
            response: expectEmptyResult,
          },
          reservedSpace: {
            statusCode: 400,
            response: expectReservedSpaceResult,
          },
          doesntExist: {
            statusCode: 404,
            response: expectNotFound,
          },
        },
      });

      deleteTest(`dual-privileges user from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.dualAll.USERNAME,
          password: scenario.users.dualAll.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 204,
            response: expectEmptyResult,
          },
          reservedSpace: {
            statusCode: 400,
            response: expectReservedSpaceResult,
          },
          doesntExist: {
            statusCode: 404,
            response: expectNotFound,
          },
        },
      });

      deleteTest(`legacy user from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.legacyAll.USERNAME,
          password: scenario.users.legacyAll.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 204,
            response: expectEmptyResult,
          },
          reservedSpace: {
            statusCode: 400,
            response: expectReservedSpaceResult,
          },
          doesntExist: {
            statusCode: 404,
            response: expectNotFound,
          },
        },
      });

      deleteTest(`rbac user with read globally from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.readGlobally.USERNAME,
          password: scenario.users.readGlobally.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
          reservedSpace: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
          doesntExist: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
        },
      });

      deleteTest(`dual-privileges readonly user from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.dualRead.USERNAME,
          password: scenario.users.dualRead.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
          reservedSpace: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
          doesntExist: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
        },
      });

      deleteTest(`legacy readonly user from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.legacyRead.USERNAME,
          password: scenario.users.legacyRead.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 403,
            response: createExpectLegacyForbidden(
              scenario.users.legacyRead.USERNAME,
              'write/delete'
            ),
          },
          reservedSpace: {
            statusCode: 400,
            response: expectReservedSpaceResult,
          },
          doesntExist: {
            statusCode: 404,
            response: expectNotFound,
          },
        },
      });

      deleteTest(`rbac user with all at space from the ${scenario.spaceId} space`, {
        spaceId: scenario.spaceId,
        auth: {
          username: scenario.users.allAtSpace.USERNAME,
          password: scenario.users.allAtSpace.PASSWORD,
        },
        tests: {
          exists: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
          reservedSpace: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
          doesntExist: {
            statusCode: 403,
            response: expectRbacForbidden,
          },
        },
      });
    });
  });
}