// List Environments API: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-deployments/#api-repositories-workspace-repo-slug-environments-get
// Create Env Vars   API: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pipelines/#api-repositories-workspace-repo-slug-pipelines-config-variables-post

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { getAuthorizationHeader, getBitucketCloudHost } from './helpers';
import { InputError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import { v4 as uuidv4 } from 'uuid';
import { examples } from './repo-pipeline-env-vars-examples';

/**
 * Creates a new action to update pipeline configuration for a Bitbucket Cloud repository
 */
export function createBitbucketCloudRepositoryEnvironmentVariableAction(options: {
    integrations: ScmIntegrations
}) {

    // configuration of the Bitbucket Cloud 
    const { integrations } = options;
    const integrationConfig = integrations.bitbucketCloud.byHost(getBitucketCloudHost());
    if (!integrationConfig) {
        throw new Error('No Bitbucket Cloud integration found');
    }
    const bitbucketCloudConfig = integrationConfig?.config;

    // create template action
    return createTemplateAction<{
        workspace: string;
        repo: string;
        environment: string;
        variables: { key: string; value: string; secured: boolean }[];
    }>({
        id: 'bitbucketCloud:repositories:createEnvironmentVariables',
        description: 'Create a variable for a repository environment',
        examples: examples,
        schema: {
            input: {
                type: 'object',
                required: ['workspace', 'repo', 'environment', 'variables'],
                properties: {
                    workspace: {
                        title: 'Workspace',
                        type: 'string',
                        description: 'The workspace of the repository',
                    },
                    repo: {
                        title: 'Repo',
                        type: 'string',
                        description: 'The repository name',
                    },
                    environment: {
                        title: 'Environment',
                        type: 'string',
                        description: 'The environment',
                    },
                    variables: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['key', 'value'],
                            properties: {
                                key: {
                                    title: 'Key',
                                    type: 'string',
                                    description: 'The key',
                                },
                                value: {
                                    title: 'Value',
                                    type: 'string',
                                    description: 'The value',
                                },
                                secured: {
                                    title: 'Secured',
                                    type: 'boolean',
                                    description: 'The secured',
                                },
                            },
                        },
                    },
                },
            },
        },
        async handler(ctx) {

            const { workspace, repo, environment, variables } = ctx.input;
            if (!workspace || !repo || !environment || !variables || variables.length === 0) {
                throw new InputError('Invalid input parameters');
            }

            // Log the parameters
            ctx.logger.info(
                `Running example template with parameters: ${ctx.input}`,
            );

            // Get the API base URL
            const authorization = getAuthorizationHeader({
                username: bitbucketCloudConfig.username,
                appPassword: bitbucketCloudConfig.appPassword,
                token: bitbucketCloudConfig.token
            });

            // get repository environment uuid by environment name
            const environmentUuid = await getRepositoryEnvironmentUuid({
                workspace,
                repo,
                environment,
                authorization,
                apiBaseUrl: bitbucketCloudConfig.apiBaseUrl
            });
            ctx.logger.info(`Environment UUID: ${environmentUuid}`);


            // Fetch the integration
            for (const element of variables) {
                await createRepositoryEnvironmentVariable({
                    workspace,
                    repo,
                    environmentUuid,
                    key: element.key,
                    value: element.value,
                    secured: element.secured,
                    authorization,
                    apiBaseUrl: bitbucketCloudConfig.apiBaseUrl
                });
                ctx.logger.info(`Variable ${element.key} created into environment ${environment}`);
            };
        },
    });
}

/**
 * Set a repository pipeline configuration
 * @param options 
 * @returns 
 */
const createRepositoryEnvironmentVariable = async (options: {
    workspace: string;
    repo: string;
    authorization: string;
    apiBaseUrl: string;
    environmentUuid: string;
    key: string;
    value: string;
    secured?: boolean;
}) => {

    const { workspace, repo, key, value, secured, authorization, apiBaseUrl, environmentUuid } = options;

    const request: RequestInit = {
        method: 'POST',
        body: JSON.stringify({
            type: 'string',
            uuid: uuidv4(),
            key: key,
            value: value,
            secured: secured
        }),
        headers: {
            Authorization: authorization,
            'Content-Type': 'application/json',
        },
    };

    let response: Response;
    try {
        response = await fetch(
            `${apiBaseUrl}/repositories/${workspace}/${repo}/deployments_config/environments/${environmentUuid}/variables`,
            request,
        );
    } catch (e) {
        throw new Error(`Unable to create repository, ${e}`);
    }

    if (response.status !== 201) {
        throw new Error(
            `Unable to create repository variable, ${response.status} ${response.statusText
            }, ${await response.text()}`,
        );
    }

    return true;

}

/**
 * Get repository environment uuid by environment name
 * @param options
 * @returns environmentUuid
 */
async function getRepositoryEnvironmentUuid(options: {
    workspace: string;
    repo: string;
    environment: string;
    authorization: string;
    apiBaseUrl: string;
}) {

    const { workspace, repo, environment, authorization, apiBaseUrl } = options;

    const request: RequestInit = {
        method: 'GET',
        headers: {
            Authorization: authorization,
            'Content-Type': 'application/json',
        },
    };

    let response: Response;
    try {
        response = await fetch(
            `${apiBaseUrl}/repositories/${workspace}/${repo}/environments`,
            request
        );
    } catch (e) {
        throw new Error(`Unable to get repository environments, ${e}`);
    }

    if (response.status !== 200) {
        throw new Error(
            `Unable to get repository environment, ${response.status} ${response.statusText}, ${await response.text()}`
        );
    }

    const environments = await response.json();
    console.log(JSON.stringify(environments));

    const environmentUuid = environments.values.find((element: { name: string; }) => element.name.toLowerCase() === environment.toLowerCase())?.uuid;

    if (!environmentUuid) {
        throw new Error(
            `Environment '${environment}' not found in '${workspace}/${repo}'.`
        );
    }

    return environmentUuid;

}
