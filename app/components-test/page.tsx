import { Bell, Package } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/modules/core/ui/avatar';
import { Badge } from '@/modules/core/ui/badge';
import { Button } from '@/modules/core/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/modules/core/ui/card';
import { Checkbox } from '@/modules/core/ui/checkbox';
import { Input } from '@/modules/core/ui/input';
import { Label } from '@/modules/core/ui/label';
import { Skeleton } from '@/modules/core/ui/skeleton';
import { Switch } from '@/modules/core/ui/switch';

export default function ComponentsTestPage() {
  return (
    <div className="container mx-auto space-y-10 p-8">
      <h1 className="text-2xl font-bold">Component Visual Test Page</h1>

      <section
        data-testid="button-variants"
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section
        data-testid="badges"
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Status badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </section>

      <section
        data-testid="cards"
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Card</h2>
        <div className="max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Card title
              </CardTitle>
              <CardDescription>Card description supporting text.</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full rounded-lg" />
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Confirm</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section
        data-testid="forms"
        className="max-w-sm space-y-6"
      >
        <h2 className="text-xl font-semibold">Form controls</h2>
        <div className="space-y-2">
          <Label htmlFor="ct-email">Email</Label>
          <Input
            id="ct-email"
            type="email"
            placeholder="name@example.com"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="ct-check" />
          <Label htmlFor="ct-check">Checkbox option</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="ct-switch" />
          <Label htmlFor="ct-switch">Switch setting</Label>
        </div>
      </section>

      <section
        data-testid="misc"
        className="flex items-center gap-6"
      >
        <h2 className="text-xl font-semibold">Misc</h2>
        <Avatar>
          <AvatarFallback>FF</AvatarFallback>
        </Avatar>
        <Button
          size="icon"
          variant="ghost"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </section>
    </div>
  );
}
