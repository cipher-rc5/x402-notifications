'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Crown, Infinity, Rocket, Zap } from 'lucide-react';
import { useState } from 'react';

interface PricingSelectorProps {
  userId: string;
  onPlanSelected: (model: 'pay-per-use' | 'subscription', planId?: string, customPrice?: number) => void;
}

export function PricingSelector({ userId, onPlanSelected }: PricingSelectorProps) {
  const [selectedModel, setSelectedModel] = useState<'pay-per-use' | 'subscription'>('subscription');
  const [selectedPlan, setSelectedPlan] = useState('plan-starter');
  const [customPrice, setCustomPrice] = useState(0.99);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const subscriptionPlans = [{
    id: 'plan-free',
    name: 'Free',
    icon: Zap,
    price: 0,
    yearlyPrice: 0,
    limit: '100',
    features: ['100 notifications/month', 'Email notifications', 'Basic MCP integration']
  }, {
    id: 'plan-starter',
    name: 'Starter',
    icon: Rocket,
    price: 9.99,
    yearlyPrice: 99.99,
    limit: '1,000',
    popular: true,
    features: ['1,000 notifications/month', 'Email + SMS', 'Full MCP integration', 'API access']
  }, {
    id: 'plan-pro',
    name: 'Pro',
    icon: Crown,
    price: 29.99,
    yearlyPrice: 299.99,
    limit: '10,000',
    features: ['10,000 notifications/month', 'All channels', 'Priority support', 'Custom conditions', 'Webhooks']
  }, {
    id: 'plan-unlimited',
    name: 'Unlimited',
    icon: Infinity,
    price: 99.99,
    yearlyPrice: 999.99,
    limit: 'Unlimited',
    features: ['Unlimited notifications', 'All channels', '24/7 support', 'Custom integrations', 'SLA guarantee']
  }];

  const handleSubmit = () => {
    if (selectedModel === 'pay-per-use') {
      onPlanSelected('pay-per-use', undefined, customPrice);
    } else {
      onPlanSelected('subscription', selectedPlan);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h3 className='text-lg font-semibold'>Choose Your Pricing Model</h3>
        <p className='text-sm text-muted-foreground'>Select between flexible pay-per-use or predictable subscription billing</p>
      </div>

      <Tabs value={selectedModel} onValueChange={(v) => setSelectedModel(v as typeof selectedModel)}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='pay-per-use'>Pay Per Use</TabsTrigger>
          <TabsTrigger value='subscription'>Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value='pay-per-use' className='space-y-4 mt-6'>
          <Card className='p-6 space-y-4'>
            <div className='space-y-2'>
              <h4 className='font-semibold'>Flexible Pay-Per-Use</h4>
              <p className='text-sm text-muted-foreground'>
                Pay only for the notifications you send. Perfect for irregular usage patterns or testing.
              </p>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='custom-price'>Price Per Notification (USDC)</Label>
                <Input
                  id='custom-price'
                  type='number'
                  step='0.01'
                  min='0.10'
                  max='10.00'
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number.parseFloat(e.target.value))}
                  className='font-mono' />
                <p className='text-xs text-muted-foreground'>Recommended: $0.99 per notification. Adjust between $0.10 - $10.00</p>
              </div>

              <div className='p-4 rounded-lg bg-muted space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Example: 100 notifications</span>
                  <span className='font-semibold'>${(customPrice * 100).toFixed(2)} USDC</span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>Example: 1,000 notifications</span>
                  <span className='font-semibold'>${(customPrice * 1000).toFixed(2)} USDC</span>
                </div>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-semibold'>Benefits:</p>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-[#03E1FF] mt-0.5 shrink-0' />
                    <span>No monthly commitment</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-[#03E1FF] mt-0.5 shrink-0' />
                    <span>Pay only for what you use</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-[#03E1FF] mt-0.5 shrink-0' />
                    <span>Micro-payment via x402 protocol</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Check className='h-4 w-4 text-[#03E1FF] mt-0.5 shrink-0' />
                    <span>Works on Solana & EVM networks</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value='subscription' className='space-y-4 mt-6'>
          <div className='flex items-center justify-center gap-4 mb-4'>
            <Button variant={billingPeriod === 'monthly' ? 'default' : 'outline'} onClick={() => setBillingPeriod('monthly')} size='sm'>
              Monthly
            </Button>
            <Button variant={billingPeriod === 'yearly' ? 'default' : 'outline'} onClick={() => setBillingPeriod('yearly')} size='sm'>
              Yearly
              <Badge variant='secondary' className='ml-2'>Save 17%</Badge>
            </Button>
          </div>

          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className='grid gap-4 md:grid-cols-2'>
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              const price = billingPeriod === 'monthly' ? plan.price : plan.yearlyPrice;
              const priceLabel = billingPeriod === 'monthly' ? '/mo' : '/yr';

              return (
                <label key={plan.id} htmlFor={plan.id} className='cursor-pointer'>
                  <Card
                    className={`p-6 space-y-4 transition-all duration-300 relative ${
                      selectedPlan === plan.id ?
                        'border-[#DC1FFF] bg-[#DC1FFF]/5 backdrop-blur-sm shadow-[0_0_20px_rgba(220,31,255,0.3)] scale-[1.02]' :
                        'border-slate-800/50 bg-slate-900/40 backdrop-blur-sm hover:border-slate-700/50 hover:bg-slate-900/60 shadow-lg'
                    } ${plan.popular ? 'border-[#DC1FFF]/50' : ''}`}>
                    {plan.popular && <Badge className='absolute -top-2 left-1/2 -translate-x-1/2'>Most Popular</Badge>}

                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-primary/10'>
                          <Icon className='h-5 w-5 text-primary' />
                        </div>
                        <div>
                          <h4 className='font-semibold'>{plan.name}</h4>
                          <p className='text-xs text-muted-foreground'>{plan.limit} notifications</p>
                        </div>
                      </div>
                      <RadioGroupItem value={plan.id} id={plan.id} className='mt-1' />
                    </div>

                    <div className='space-y-1'>
                      <div className='flex items-baseline gap-1'>
                        <span className='text-3xl font-bold'>${price}</span>
                        <span className='text-muted-foreground text-sm'>{priceLabel}</span>
                      </div>
                      {billingPeriod === 'yearly' && price > 0 && (
                        <p className='text-xs text-muted-foreground'>${(price / 12).toFixed(2)}/month billed yearly</p>
                      )}
                    </div>

                    <ul className='space-y-2'>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className='flex items-start gap-2 text-sm'>
                          <Check className='h-4 w-4 text-[#03E1FF] mt-0.5 shrink-0' />
                          <span className='text-muted-foreground'>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </label>
              );
            })}
          </RadioGroup>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSubmit} className='w-full' size='lg'>
        Continue with {selectedModel === 'pay-per-use' ? 'Pay-Per-Use' : 'Subscription'}
      </Button>
    </div>
  );
}
