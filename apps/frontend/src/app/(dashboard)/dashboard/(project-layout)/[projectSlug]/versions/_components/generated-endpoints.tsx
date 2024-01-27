import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { ScrollArea } from '@components/ui/scroll-area';
import { TooltipProvider } from '@components/ui/tooltip';
import type { ApiProject } from '@lib/backend/backend-types';
import { CreateSchemaFormSchema } from '@lib/backend/schemas/schemas-types';
import SingleEndpoint from './single-endpoint';

type Props = {
  height: string;
  project: ApiProject;
  value?: string;
};

const MethodsRequireId = ['GET', 'PUT', 'PATCH', 'DELETE'] as const;
const MethodsWithoutId = ['GET', 'POST'] as const;

export default function GeneratedEndpoints({ height, project, value }: Props) {
  if (!value) {
    return (
      <div className="flex h-full items-center justify-center p-2 text-center">
        JSON is not parsable, please fix errors and try again.
      </div>
    );
  }

  const parsedJson = CreateSchemaFormSchema.parse(JSON.parse(value));

  return (
    <section
      className="flex flex-col space-y-2 bg-neutral-100 px-1 py-2"
      style={{
        height,
      }}
    >
      <header>
        <p className="font-medium">Generated Endpoints</p>
        <p className="text-sm text-neutral-500">
          Click an endpoint to copy the URL
        </p>
      </header>
      <ScrollArea className="grow rounded-md">
        <Accordion className="space-y-2" type="multiple">
          {Object.keys(parsedJson.data).map((resourceName) => (
            <AccordionItem
              className="rounded-md border bg-white"
              key={resourceName}
              value={resourceName}
            >
              <AccordionTrigger className="px-2 data-[state=open]:border-b">
                <span>
                  /api/v{parsedJson.version}/{resourceName}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-1 p-2">
                <TooltipProvider delayDuration={250}>
                  {MethodsWithoutId.map((method) => (
                    <SingleEndpoint
                      key={method}
                      method={method}
                      url={`https://${project.slug}.fake.sh/api/v${parsedJson.version}/${resourceName}`}
                    />
                  ))}
                  {MethodsRequireId.map((method) => (
                    <SingleEndpoint
                      key={method}
                      method={method}
                      url={`https://${project.slug}.fake.sh/api/v${parsedJson.version}/${resourceName}/:id`}
                    />
                  ))}
                </TooltipProvider>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </section>
  );
}
