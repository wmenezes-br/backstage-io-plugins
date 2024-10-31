import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
    {
        description: 'Create a variable in the repository',
        example: yaml.stringify({
            steps: [
                {
                    action: 'bitbucketCloud:repositories:createVariables',
                    id: 'repo-create-variable',
                    name: 'Create Repository Variable',
                    input: {
                        workspace: 'ciandt_it',
                        repo: 'repository-slug',
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