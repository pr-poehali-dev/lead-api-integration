import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: string;
  source?: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Stats {
  new?: number;
  in_progress?: number;
  completed?: number;
  rejected?: number;
}

const Index = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const url = statusFilter === 'all' 
        ? 'https://functions.poehali.dev/fbc2766d-7a1d-423c-8c84-3ca85b8957c6'
        : `https://functions.poehali.dev/fbc2766d-7a1d-423c-8c84-3ca85b8957c6?status=${statusFilter}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setLeads(data.leads || []);
      setStats(data.stats || {});
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заявки',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const updateLeadStatus = async (leadId: number, newStatus: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/fbc2766d-7a1d-423c-8c84-3ca85b8957c6', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus })
      });

      if (response.ok) {
        toast({
          title: 'Статус обновлён',
          description: 'Статус заявки успешно изменён',
        });
        loadLeads();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const seedDatabase = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/50533d4b-0104-4a37-904e-25a66c053744', {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: 'База заполнена!',
          description: 'Добавлено 12 тестовых заявок',
        });
        loadLeads();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось заполнить базу',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Новая';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершена';
      case 'rejected': return 'Отклонена';
      default: return status;
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalLeads = Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="Database" className="text-primary" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-secondary">CRM Система</h1>
              <p className="text-sm text-muted-foreground">Управление заявками</p>
            </div>
          </div>
          <div className="flex gap-2">
            {totalLeads === 0 && (
              <Button onClick={seedDatabase} variant="outline">
                <Icon name="Database" size={16} className="mr-2" />
                Заполнить тестовыми данными
              </Button>
            )}
            <Button onClick={loadLeads}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Всего заявок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalLeads}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Новые</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.new || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">В работе</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.in_progress || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Завершено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <CardTitle>Список заявок</CardTitle>
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <Input
                  placeholder="Поиск по имени, email, компании..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:w-80"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="new">Новые</SelectItem>
                    <SelectItem value="in_progress">В работе</SelectItem>
                    <SelectItem value="completed">Завершено</SelectItem>
                    <SelectItem value="rejected">Отклонено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Заявки не найдены</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Имя</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Телефон</TableHead>
                      <TableHead>Компания</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">#{lead.id}</TableCell>
                        <TableCell>{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone || '—'}</TableCell>
                        <TableCell>{lead.company || '—'}</TableCell>
                        <TableCell>
                          <Select
                            value={lead.status}
                            onValueChange={(value) => updateLeadStatus(lead.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={getStatusColor(lead.status)}>
                                {getStatusLabel(lead.status)}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Новая</SelectItem>
                              <SelectItem value="in_progress">В работе</SelectItem>
                              <SelectItem value="completed">Завершена</SelectItem>
                              <SelectItem value="rejected">Отклонена</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {new Date(lead.created_at).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;