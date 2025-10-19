import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('https://functions.poehali.dev/ff8abe0b-9d49-44c3-83bf-27efed628132', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'demo-key'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Заявка отправлена!',
          description: 'Мы свяжемся с вами в ближайшее время.',
        });
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: 'TrendingUp',
      title: 'Консалтинг',
      description: 'Стратегическое планирование и оптимизация бизнес-процессов для роста вашей компании'
    },
    {
      icon: 'Shield',
      title: 'Аудит и безопасность',
      description: 'Комплексная проверка систем и защита от рисков на всех уровнях организации'
    },
    {
      icon: 'Zap',
      title: 'Цифровизация',
      description: 'Автоматизация процессов и внедрение современных технологических решений'
    },
    {
      icon: 'Users',
      title: 'Управление проектами',
      description: 'Профессиональное сопровождение проектов от идеи до успешной реализации'
    }
  ];

  const stats = [
    { value: '500+', label: 'Реализованных проектов' },
    { value: '15 лет', label: 'На рынке' },
    { value: '98%', label: 'Удовлетворенных клиентов' },
    { value: '200+', label: 'Специалистов' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Icon name="Building2" className="text-primary" size={28} />
            <span className="text-xl font-bold text-secondary">КОМПАНИЯ</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#about" className="text-foreground hover:text-primary transition-colors">О компании</a>
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Услуги</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Контакты</a>
          </div>
          <Button variant="default">Связаться</Button>
        </div>
      </nav>

      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-secondary leading-tight">
              Решения для развития вашего бизнеса
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Профессиональный консалтинг и технологические решения для компаний, 
              стремящихся к лидерству на рынке
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="text-base">
                Начать сотрудничество
              </Button>
              <Button size="lg" variant="outline" className="text-base">
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-secondary">О компании</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Мы — команда профессионалов с многолетним опытом в области бизнес-консалтинга 
              и внедрения технологических решений. Наша миссия — помогать компаниям достигать 
              новых высот через инновации и проверенные методологии.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Icon name="Target" className="text-primary mb-3" size={40} />
                <CardTitle>Наша цель</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Создание устойчивых конкурентных преимуществ для наших клиентов
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Icon name="Award" className="text-primary mb-3" size={40} />
                <CardTitle>Наши ценности</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Профессионализм, прозрачность и ориентация на результат
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Icon name="Lightbulb" className="text-primary mb-3" size={40} />
                <CardTitle>Наш подход</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Индивидуальные решения на основе глубокого анализа и экспертизы
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">Наши услуги</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Комплексные решения для эффективного развития вашего бизнеса
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardHeader>
                  <Icon name={service.icon} className="text-primary mb-4" size={48} />
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">Свяжитесь с нами</h2>
              <p className="text-lg text-muted-foreground">
                Оставьте заявку, и наш специалист свяжется с вами в течение 24 часов
              </p>
            </div>
            <Card className="border-2">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Иван Иванов"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Компания</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="ООО «Компания»"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Сообщение</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Расскажите о вашем проекте или задаче..."
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-secondary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Building2" className="text-primary" size={24} />
                <span className="text-lg font-bold">КОМПАНИЯ</span>
              </div>
              <p className="text-primary-foreground/80 text-sm">
                Профессиональные решения для развития вашего бизнеса
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Контакты</h3>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  <span>info@company.ru</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  <span>+7 (495) 123-45-67</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="MapPin" size={16} />
                  <span>Москва, ул. Примерная, д. 1</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Режим работы</h3>
              <div className="space-y-2 text-sm text-primary-foreground/80">
                <p>Пн-Пт: 9:00 - 18:00</p>
                <p>Сб-Вс: Выходной</p>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
            © 2024 КОМПАНИЯ. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;