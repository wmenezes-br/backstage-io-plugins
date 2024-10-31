// API: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pipelines/#api-repositories-workspace-repo-slug-pipelines-config-variables-post

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { getAuthorizationHeader } from './helpers';
import { InputError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import { v4 as uuidv4 } from 'uuid';
import { examples } from './repo-pipeline-vars-examples';

/**
 * Creates a new action to update pipeline configuration for a Bitbucket Cloud repository
 */
export function createBitbucketCloudRepositoryVariableAction(options: {
    integrations: ScmIntegrations
}) {

    // configuration of the Bitbucket Cloud 
    const { integrations } = options;
    const integrationConfig = integrations.bitbucketCloud.byHost('bitbucket.org');
    if (!integrationConfig) {
        throw new Error('No Bitbucket Cloud integration found ');
    }
    const bitbucketCloudConfig = integrationConfig?.config;

    // create template action
    return createTemplateAction<{
        workspace: string;
        repo: string;
        variables: { key: string; value: string; secured: boolean }[];
    }>({
        id: 'bitbucketCloud:repositories:createVariables',
        description: 'Create a variable for a Bitbucket Cloud repository',
        examples: examples,
        schema: {
            input: {
                type: 'object',
                required: ['workspace', 'repo', 'variables'],
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

            const { workspace, repo, variables } = ctx.input;
            if (!workspace || !repo || !variables || variables.length === 0) {
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

            // Fetch the integration
            for (const element of variables) {
                await createVariableForBitbucketRepository({
                    workspace,
                    repo,
                    key: element.key,
                    value: element.value,
                    secured: element.secured,
                    authorization,
                    apiBaseUrl: bitbucketCloudConfig.apiBaseUrl
                });
            };
            
        },
    });
}


/**
 * Set a repository pipeline configuration
 * @param options 
 * @returns 
 */
const createVariableForBitbucketRepository = async (options: {
    workspace: string;
    repo: string;
    authorization: string;
    apiBaseUrl: string;
    key: string;
    value: string;
    secured?: boolean;
}) => {

    const { workspace, repo, key, value, secured, authorization, apiBaseUrl } = options;

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
            `${apiBaseUrl}/repositories/${workspace}/${repo}/pipelines_config/variables`,
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