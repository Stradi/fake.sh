import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@components/ui/accordion';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { ScrollArea } from '@components/ui/scroll-area';
import { CreateSchemaFormSchema } from '@lib/backend/schemas/schemas-types';
import { TrashIcon } from '@radix-ui/react-icons';
import { type ChangeEvent, type MouseEvent } from 'react';

type Props = {
  height: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export default function VisualEditor({ height, value, onValueChange }: Props) {
  if (!value) {
    return (
      <div
        className="flex items-center justify-center p-2 text-center"
        style={{
          height,
        }}
      >
        JSON is not parsable, please fix errors and try again.
      </div>
    );
  }

  const parsedJson = CreateSchemaFormSchema.parse(JSON.parse(value));

  function renameObjectKey<T>(obj: T, oldKey: keyof T, newKey: string) {
    const renamed = { ...obj };
    if (newKey !== oldKey) {
      Object.defineProperty(
        renamed,
        newKey,
        // @ts-expect-error -- TS doesn't like this, but it works
        Object.getOwnPropertyDescriptor(renamed, oldKey)
      );
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- we need to delete the old key
      delete renamed[oldKey];
    }

    return renamed;
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const newUpdatedData = { ...parsedJson };

    const [resourceName, resourceProperty, ...columnProperty] =
      e.target.name.split('.');

    if (resourceProperty === 'initialCount') {
      newUpdatedData.data[resourceName].initialCount = Number(e.target.value);
      onValueChange?.(JSON.stringify(newUpdatedData, null, 2));
      return;
    }

    if (resourceProperty === 'columns') {
      const [oldColumnName, keyOrValue] = columnProperty;
      const newValue = e.target.value;

      if (keyOrValue === 'key') {
        // Store the old column value in a temp variable
        const oldColumnValue =
          newUpdatedData.data[resourceName].columns[oldColumnName];

        // Remove old column name
        const { [oldColumnName]: _, ...rest } =
          newUpdatedData.data[resourceName].columns;

        // Add rest of the columns and the new column
        newUpdatedData.data[resourceName].columns = rest;
        newUpdatedData.data[resourceName].columns[newValue] = oldColumnValue;
      } else if (keyOrValue === 'value') {
        newUpdatedData.data[resourceName].columns[oldColumnName] = newValue;
      }

      onValueChange?.(JSON.stringify(newUpdatedData, null, 2));
    }
  }

  function deleteColumn(e: MouseEvent<HTMLButtonElement>) {
    const newUpdatedData = { ...parsedJson };

    const [resourceName, _, columnName] = e.currentTarget.name.split('.');

    const { [columnName]: __, ...rest } =
      newUpdatedData.data[resourceName].columns;
    newUpdatedData.data[resourceName].columns = rest;

    onValueChange?.(JSON.stringify(newUpdatedData, null, 2));
  }

  function addNewColumn(e: MouseEvent<HTMLButtonElement>) {
    const newUpdatedData = { ...parsedJson };

    const [resourceName] = e.currentTarget.name.split('.');
    newUpdatedData.data[resourceName].columns[''] = '';

    onValueChange?.(JSON.stringify(newUpdatedData, null, 2));
  }

  function onResourceNameChange(e: ChangeEvent<HTMLInputElement>) {
    const newResourceName = e.target.value;
    const oldResourceName = e.target.defaultValue;

    const renamed = renameObjectKey(
      parsedJson.data,
      oldResourceName,
      newResourceName
    );

    onValueChange?.(
      JSON.stringify(
        {
          ...parsedJson,
          data: renamed,
        },
        null,
        2
      )
    );
  }

  function addNewResource() {
    const newUpdatedData = { ...parsedJson };

    newUpdatedData.data[''] = {
      initialCount: 0,
      columns: {},
    };

    onValueChange?.(JSON.stringify(newUpdatedData, null, 2));
  }

  return (
    <ScrollArea
      className="rounded-md bg-neutral-100 p-1"
      style={{
        height,
      }}
    >
      <Accordion
        className="space-y-2 [&_div.flex>input:first-child]:text-xs"
        collapsible
        type="single"
      >
        {Object.entries(parsedJson.data).map(
          ([resourceName, resourceDetails], resourceIdx) => (
            <AccordionItem
              className="rounded-md border bg-white"
              // eslint-disable-next-line react/no-array-index-key -- see below
              key={resourceIdx}
              value={`resource-${resourceIdx}`}
            >
              <AccordionTrigger className="px-2 data-[state=open]:border-b">
                {resourceName}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center gap-1 p-2">
                  <Label className="basis-1/3">Resource name</Label>
                  <Input
                    className="w-full basis-2/3"
                    defaultValue={resourceName}
                    onChange={onResourceNameChange}
                  />
                </div>
                <div className="flex items-center gap-1 p-2">
                  <Label className="basis-1/3"># of records</Label>
                  <Input
                    className="w-full basis-2/3"
                    defaultValue={resourceDetails.initialCount}
                    name={`${resourceName}.initialCount`}
                    onChange={onChange}
                    type="number"
                  />
                </div>
                <div className="space-y-1 p-2">
                  <Label>Columns</Label>
                  <div className="flex items-center gap-1">
                    <Input
                      className="basis-1/2 font-mono"
                      defaultValue="__id"
                      disabled
                    />
                    <Input defaultValue="Automatically Generated" disabled />
                    <Button
                      className="aspect-square hover:bg-red-100 hover:text-red-900"
                      disabled
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                  {Object.entries(resourceDetails.columns).map(
                    ([columnName, columnValue], columnIdx) => (
                      // We have to use index as key here. If user changes column name, the
                      // key changesand the input loses focus. Using `idx` is not a big deal tho.
                      // eslint-disable-next-line react/no-array-index-key -- see above
                      <div className="flex items-center gap-1" key={columnIdx}>
                        <Input
                          className="basis-1/2 font-mono"
                          defaultValue={columnName}
                          name={`${resourceName}.columns.${columnName}.key`}
                          onChange={onChange}
                        />
                        <Input
                          defaultValue={columnValue}
                          name={`${resourceName}.columns.${columnName}.value`}
                          onChange={onChange}
                        />
                        <Button
                          className="aspect-square hover:bg-red-100 hover:text-red-900"
                          name={`${resourceName}.columns.${columnName}`}
                          onClick={deleteColumn}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </div>
                    )
                  )}
                  <Button
                    className="w-full"
                    name={`${resourceName}.columns`}
                    onClick={addNewColumn}
                    type="button"
                    variant="secondary"
                  >
                    Add new column
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        )}
        <Button
          className="w-full"
          onClick={addNewResource}
          type="button"
          variant="outline"
        >
          Add new resource
        </Button>
      </Accordion>
    </ScrollArea>
  );
}
