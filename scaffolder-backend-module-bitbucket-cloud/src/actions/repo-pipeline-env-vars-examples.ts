import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
    {
        description: 'Create a variable in repository environment',
        example: yaml.stringify({
            steps: [
                {
                    action: 'bitbucketCloud:repositories:createEnvironmentVariables',
                    id: 'repo-create-env-var-prod',
                    name: 'Create Repository Variable',
                    input: {
                        workspace: 'ciandt_it',
                        repo: 'repository-slug',
                        environment: 'production',
                        variables: [
                            {
                                key: 'VAR1',
                                value: 'VALUE1',
                                secured: true
                            },
                            {
                                key: 'VAR2',
                                value: 'VALUE2',
                                secured: false
                            },
                        ]
                    }
                }
            ]
        })
    }
]