import { coreServices, createBackendModule } from "@backstage/backend-plugin-api";
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createBitbucketCloudPipelineAction } from "./actions/repo-pipeline-config";
import { createBitbucketCloudRepositoryVariableAction } from "./actions/repo-pipeline-vars";
import { createBitbucketCloudRepositoryEnvironmentVariableAction } from "./actions/repo-pipeline-env-vars";
import { ScmIntegrations } from '@backstage/integration';

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderBitbucketCloudPlugin = createBackendModule({
  moduleId: 'bitbucket-cloud',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig
      },
      async init({ scaffolder, config }) {
        const integrations  = ScmIntegrations.fromConfig(config);
        scaffolder.addActions(createBitbucketCloudPipelineAction({ integrations }));
        scaffolder.addActions(createBitbucketCloudRepositoryVariableAction({ integrations }));
        scaffolder.addActions(createBitbucketCloudRepositoryEnvironmentVariableAction({ integrations }));
      }
    });
  },
})
