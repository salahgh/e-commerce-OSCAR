'use client';

import * as React from 'react';
import { Heart, Search, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Field,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Select,
  Tag,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  Skeleton,
  Spinner,
  Avatar,
  Breadcrumb,
  Pagination,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerTitle,
  Tooltip,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Accordion,
  AccordionItem,
  PriceDisplay,
  QuantityStepper,
  ColorSwatchGroup,
  SizeButtonGroup,
  StockIndicator,
  useToast,
} from '@/components/ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-24 font-bold text-content-strong">{title}</h2>
      <div className="flex flex-wrap items-start gap-4 rounded border border-border bg-bg-elevated p-6">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  const toast = useToast();
  const [qty, setQty] = React.useState(1);
  const [color, setColor] = React.useState('black');
  const [size, setSize] = React.useState('M');
  const [page, setPage] = React.useState(3);
  const [checked, setChecked] = React.useState(true);
  const [tab, setTab] = React.useState('description');
  const [radio, setRadio] = React.useState('cod');

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-12 uppercase tracking-wide text-content-muted">OSCAR Najar · v2</p>
        <h1 className="text-36 font-bold text-content-strong">Design System</h1>
        <p className="text-16 text-content-muted">Tokens + primitives, single source of truth.</p>
      </header>

      <Section title="Buttons · primary intent · 3 sizes">
        <Button size="sm">انقر هنا للاستمرار</Button>
        <Button size="md">انقر هنا للاستمرار</Button>
        <Button size="lg">انقر هنا للاستمرار</Button>
        <Button size="md" leadingIcon={<ArrowLeft className="h-4 w-4" />} trailingIcon={<ArrowRight className="h-4 w-4" />}>
          With icons
        </Button>
        <Button size="md" loading>Loading…</Button>
        <Button size="md" disabled>Disabled</Button>
      </Section>

      <Section title="Buttons · secondary, ghost, link, danger">
        <Button intent="secondary">Secondary</Button>
        <Button intent="ghost">Ghost</Button>
        <Button intent="link">Link</Button>
        <Button intent="danger">Danger</Button>
        <IconButton aria-label="Search"><Search className="h-4 w-4" /></IconButton>
        <IconButton aria-label="Favorite" intent="secondary"><Heart className="h-4 w-4" /></IconButton>
        <IconButton aria-label="Cart" intent="ghost" size="lg"><ShoppingBag className="h-5 w-5" /></IconButton>
      </Section>

      <Section title="Inputs · text, password, search, textarea, select">
        <Field label="Email" required hint="Nous ne partagerons jamais votre email.">
          <Input placeholder="vous@exemple.com" />
        </Field>
        <Field label="Recherche">
          <Input placeholder="Rechercher…" leadingIcon={<Search className="h-4 w-4" />} />
        </Field>
        <Field label="Mot de passe" error="Le mot de passe est trop court.">
          <Input type="password" invalid placeholder="••••••••" />
        </Field>
        <Field label="Wilaya">
          <Select defaultValue="">
            <option value="" disabled>Sélectionnez une wilaya</option>
            <option value="16">Alger</option>
            <option value="31">Oran</option>
            <option value="25">Constantine</option>
          </Select>
        </Field>
        <Field label="Commentaire" hint="Optionnel">
          <Textarea placeholder="Vos remarques pour le livreur…" />
        </Field>
      </Section>

      <Section title="Checkbox · Radio · Switch">
        <Checkbox label="J'accepte les conditions" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <Switch label="Mode sombre" />
        <RadioGroup
          name="payment"
          value={radio}
          onValueChange={setRadio}
          orientation="horizontal"
          options={[
            { value: 'cod', label: 'Paiement à la livraison' },
            { value: 'cib', label: 'Carte CIB' },
            { value: 'baridimob', label: 'Baridimob' },
          ]}
        />
      </Section>

      <Section title="Tags · 6 intents × 2 sizes">
        {(['default', 'info', 'warning', 'success', 'danger', 'dark'] as const).map((intent) => (
          <Tag key={intent} intent={intent} onClose={() => undefined}>
            {intent}
          </Tag>
        ))}
        {(['default', 'info', 'warning', 'success', 'danger', 'dark'] as const).map((intent) => (
          <Tag key={`sm-${intent}`} intent={intent} size="sm" onClose={() => undefined}>
            {intent}
          </Tag>
        ))}
      </Section>

      <Section title="Badges">
        <Badge intent="neutral">Neutre</Badge>
        <Badge intent="accent">Nouveau</Badge>
        <Badge intent="info">Promo</Badge>
        <Badge intent="success">En stock</Badge>
        <Badge intent="warning">Stock bas</Badge>
        <Badge intent="danger">-30%</Badge>
      </Section>

      <Section title="Alerts · 4 intents">
        <div className="flex w-full flex-col gap-3">
          <Alert intent="info" title="Information" onClose={() => undefined}>
            Ce produit est disponible dans toutes les wilayas.
          </Alert>
          <Alert intent="success" title="Commande validée">
            Votre commande sera livrée sous 48-72 heures.
          </Alert>
          <Alert intent="warning" title="Stock limité">
            Plus que 3 articles disponibles à ce prix.
          </Alert>
          <Alert intent="danger" title="Erreur" onClose={() => undefined}>
            Le paiement a été refusé. Veuillez réessayer.
          </Alert>
        </div>
      </Section>

      <Section title="Cards">
        <Card className="w-80">
          <div className="-m-4 mb-4 h-44 rounded-t bg-bg-muted" aria-hidden="true" />
          <CardHeader>
            <CardTitle>عنوان البطاقة</CardTitle>
            <CardDescription>هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button intent="secondary" size="sm">Secondaire</Button>
            <Button size="sm">Principal</Button>
          </CardFooter>
        </Card>
        <Card className="w-80" padding="lg">
          <CardContent>
            <p className="text-14 text-content-muted">Prix</p>
            <PriceDisplay amount={250000} originalAmount={300000} size="xl" />
            <StockIndicator stock={3} />
          </CardContent>
        </Card>
      </Section>

      <Section title="Product selectors · price, color, size, quantity, stock">
        <div className="flex w-full flex-wrap items-end gap-6">
          <Field label="Couleur">
            <ColorSwatchGroup
              value={color}
              onValueChange={setColor}
              options={[
                { value: 'black', name: 'Noir', hex: '#1E1E1E' },
                { value: 'white', name: 'Blanc', hex: '#FFFFFF' },
                { value: 'beige', name: 'Beige', hex: '#E8D4B8' },
                { value: 'navy', name: 'Marine', hex: '#1B2A4E' },
                { value: 'red', name: 'Rouge', hex: '#C03A3A' },
              ]}
            />
          </Field>
          <Field label="Taille">
            <SizeButtonGroup
              value={size}
              onValueChange={setSize}
              options={[
                { value: 'XS', label: 'XS' },
                { value: 'S', label: 'S' },
                { value: 'M', label: 'M' },
                { value: 'L', label: 'L' },
                { value: 'XL', label: 'XL', outOfStock: true },
              ]}
            />
          </Field>
          <Field label="Quantité">
            <QuantityStepper value={qty} onChange={setQty} min={1} max={10} />
          </Field>
        </div>
      </Section>

      <Section title="Tabs · Accordion">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="shipping">Livraison</TabsTrigger>
          </TabsList>
          <TabsContent value="description"><p className="text-14 text-content-muted">Description du produit…</p></TabsContent>
          <TabsContent value="details"><p className="text-14 text-content-muted">Composition, entretien, taille…</p></TabsContent>
          <TabsContent value="shipping"><p className="text-14 text-content-muted">Livraison sous 48-72h à travers toutes les wilayas.</p></TabsContent>
        </Tabs>
        <Accordion defaultValue="q1" className="w-full">
          <AccordionItem value="q1" title="Quels sont les délais de livraison ?">
            48 à 72 heures à travers toutes les wilayas d&apos;Algérie.
          </AccordionItem>
          <AccordionItem value="q2" title="Puis-je retourner un article ?">
            Oui, sous 14 jours après réception.
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title="Dialog · Drawer · Tooltip · Toast">
        <Dialog>
          <DialogTrigger asChild>
            <Button intent="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirmer la commande</DialogTitle>
            <DialogDescription>Vous êtes sur le point de finaliser votre achat.</DialogDescription>
            <div className="mt-6 flex justify-end gap-3">
              <Button intent="secondary">Annuler</Button>
              <Button>Confirmer</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Drawer>
          <DrawerTrigger asChild>
            <Button intent="secondary">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent side="right">
            <DrawerTitle>Panier</DrawerTitle>
            <p className="text-14 text-content-muted">Aperçu rapide de votre panier.</p>
          </DrawerContent>
        </Drawer>
        <Tooltip content="Ajouter aux favoris">
          <IconButton aria-label="Favorite" intent="secondary"><Heart className="h-4 w-4" /></IconButton>
        </Tooltip>
        <Button onClick={() => toast.success('Produit ajouté au panier', { title: 'Succès' })}>Toast success</Button>
        <Button intent="danger" onClick={() => toast.error('Stock insuffisant', { title: 'Erreur' })}>Toast error</Button>
      </Section>

      <Section title="Avatar · Breadcrumb · Pagination">
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback="SA" />
          <Avatar fallback="OSCAR" />
          <Avatar size="lg" fallback="OS" />
        </div>
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Femme', href: '/femme' },
            { label: 'Abayas' },
          ]}
        />
        <Pagination page={page} pageCount={10} onPageChange={setPage} />
      </Section>

      <Section title="Loading states">
        <div className="flex w-full flex-col gap-3">
          <Spinner />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Section>
    </main>
  );
}
