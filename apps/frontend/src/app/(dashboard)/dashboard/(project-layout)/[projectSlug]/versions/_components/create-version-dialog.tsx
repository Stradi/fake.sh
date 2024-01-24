'use client';

import ScalingDialogRoot from '@components/scaling-dialog';
import { Button } from '@components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@components/ui/dialog';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@components/ui/resizable';
import { useState } from 'react';
import CodeMirrorEditor from './code-mirror-editor';

type Props = {
  defaultVersionNumber?: number;
};

export default function CreateVersionDialog({
  defaultVersionNumber = 1,
}: Props) {
  const [open, setOpen] = useState(false);
  const defaultEditorText = `{
  "version": ${defaultVersionNumber},
  "data": {
    <CURSOR>
  }
}`;

  return (
    <ScalingDialogRoot
      onClose={() => {
        setOpen(false);
      }}
      onOpen={() => {
        setOpen(true);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button>Create Version</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[750px]"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Version</DialogTitle>
          <DialogDescription>
            Create a new version of your mock API.
          </DialogDescription>
        </DialogHeader>
        <div>
          <ResizablePanelGroup
            className="min-h-96 rounded-md border"
            direction="horizontal"
          >
            <ResizablePanel maxSize={100} minSize={10}>
              <CodeMirrorEditor
                defaultCursorPosition={defaultEditorText.indexOf('<CURSOR>')}
                defaultValue={defaultEditorText.replace('<CURSOR>', '')}
                height="384px"
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel maxSize={100} minSize={10}>
              <div className="p-4">Two</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </DialogContent>
    </ScalingDialogRoot>
  );
}
