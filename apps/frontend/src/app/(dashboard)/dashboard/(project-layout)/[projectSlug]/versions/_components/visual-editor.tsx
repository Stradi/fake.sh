import { ScrollArea } from '@components/ui/scroll-area';

type Props = {
  height: string;
};

export default function VisualEditor({ height }: Props) {
  return (
    <ScrollArea
      style={{
        height,
      }}
    >
      Not Implemented Yet
    </ScrollArea>
  );
}
