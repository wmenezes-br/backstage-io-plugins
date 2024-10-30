// API: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pipelines/#api-repositories-workspace-repo-slug-pipelines-config-put

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { getAuthorizationHeader } from './helpers';
import { InputError } from '@backstage/errors';
import { ScmIntegrations } from '@backstage/integration';
import { examples } from './repo-pipeline-config-examples';


/**
 * Creates a new action to update pipeline configuration for a Bitbucket Cloud repository
 */
export function createBitbucketCloudPipelineAction(options: {
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
        enabled: boolean;
    }>({
        id: 'bitbucketCloud:repositories:configurePipeline',
        description: 'Update the pipelines configuration for a repository',
        examples: examples,
        schema: {
            input: {
                type: 'object',
                required: ['workspace','repo', 'enabled'],
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
                    enabled: {
                        title: 'Enable/disable pipeline',
                        description: "Enable (set true) or disable (set false) pipeline feature",
                        type: 'boolean',
                    },
                },
            },
        },
        async handler(ctx) {

            const { workspace, repo, enabled } = ctx.input;
            if (!workspace || !repo || enabled === undefined) {
                throw new InputError('Invalid input parameters');
            }

            // Log the parameters
            ctx.logger.info(
                `Running example template with parameters: ${JSON.stringify(ctx.input)}`,
            );

            // Get the API base URL
            const authorization = getAuthorizationHeader({
                username: bitbucketCloudConfig.username,
                appPassword: bitbucketCloudConfig.appPassword,
                token: bitbucketCloudConfig.token
            });

            // Fetch the integration
            await configureBitbucketCloudPipelineRepository({
                workspace,
                repo,
                enabled,
                authorization,
                apiBaseUrl: bitbucketCloudConfig.apiBaseUrl
            });
        },
    });
}


/**
 * Set a repository pipeline configuration
 * @param options 
 * @returns 
 */
const configureBitbucketCloudPipelineRepository = async (options: {
    workspace: string;
    repo: string;
    enabled: boolean;
    authorization: string;
    apiBaseUrl: string;
}) => {

    const { workspace, repo, enabled, authorization, apiBaseUrl } = options;

    const request: RequestInit = {
        method: 'PUT',
        body: JSON.stringify({ enabled: enabled }),
        headers: {
            Authorization: authorization,
            'Content-Type': 'application/json',
        },
    };

    let response: Response;
    try {
        response = await fetch(
            `${apiBaseUrl}/repositories/${workspace}/${repo}/pipelines_config`,
            request,
        );
    } catch (e) {
        throw new Error(`Unable to configure repository pipelines, ${e}`);
    }

    if (response.status !== 200) {
        throw new Error(
            `Unable to configure repository pipelines, ${response.status} ${response.statusText
            }, ${await response.text()}`,
        );
    }

    return true;

}