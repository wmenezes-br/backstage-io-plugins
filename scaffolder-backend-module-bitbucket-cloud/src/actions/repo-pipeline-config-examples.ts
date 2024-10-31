import { TemplateExample } from '@backstage/plugin-scaffolder-node';
import yaml from 'yaml';

export const examples: TemplateExample[] = [
    {
        description: 'Enabling the pipeline functionality of a repository',
        example: yaml.stringify({
            steps:[
                {
                    action: 'bitbucketCloud:repositories:configurePipeline',
                    id: 'pipeline-config',
                    name: 'Pipeline Configuration',
                    input:{
                        workspace: 'ciandt_it',
                        repo: 'repository-slug',
                        enabled: true,
                    }
                }
            ]
        })
    },
    {
        description: 'Desabling the pipeline functionality of a repository',
        example: yaml.stringify({
            steps:[
                {
                    action: 'bitbucketCloud:repositories:configurePipeline',
                    id: 'pipeline-config',
                    name: 'Pipeline Configuration',
                    input:{
                        workspace: 'ciandt_it',
                        repo: 'repository-slug',
                        enabled: false,
                    }
                }
            ]
        })
    }
]