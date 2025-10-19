'''
Business: Заполнение базы тестовыми данными для демонстрации
Args: event - dict с httpMethod; context - объект с request_id
Returns: HTTP response dict с количеством добавленных записей
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import Json

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        test_leads = [
            ('Алексей Иванов', 'ivanov@company.ru', '+7 (495) 123-45-67', 'ООО "Техносфера"', 'Интересует внедрение CRM системы для отдела продаж', 'new', 'website', {'utm_source': 'google', 'utm_campaign': 'crm'}),
            ('Мария Петрова', 'petrova@biznes.ru', '+7 (495) 234-56-78', 'ИП Петрова М.А.', 'Нужна консультация по автоматизации бизнес-процессов', 'new', 'landing', {'utm_source': 'yandex', 'budget': '50000'}),
            ('Дмитрий Сидоров', 'sidorov@megacorp.ru', '+7 (499) 345-67-89', 'МегаКорп', 'Запрос коммерческого предложения на разработку системы учета', 'in_progress', 'email', {'referrer': 'partner', 'priority': 'high'}),
            ('Елена Смирнова', 'smirnova@retail.com', '+7 (495) 456-78-90', 'Ритейл Групп', 'Хотим модернизировать систему управления складом', 'in_progress', 'phone', {'employee_count': '50-100', 'industry': 'retail'}),
            ('Игорь Козлов', 'kozlov@startup.io', '+7 (926) 567-89-01', 'StartUp Inc', 'Ищем решение для управления проектами команды', 'completed', 'website', {'utm_source': 'linkedin', 'team_size': '10'}),
            ('Анна Волкова', 'volkova@finance.ru', '+7 (495) 678-90-12', 'Финанс Групп', 'Требуется интеграция с 1С', 'completed', 'referral', {'integration_type': '1c', 'has_budget': 'true'}),
            ('Сергей Морозов', 'morozov@test.ru', '+7 (903) 789-01-23', None, 'Общий вопрос по услугам', 'rejected', 'website', {'reason': 'not_relevant'}),
            ('Ольга Новикова', 'novikova@consulting.ru', '+7 (495) 890-12-34', 'Консалтинг Плюс', 'Партнерское предложение', 'new', 'email', {'type': 'partnership'}),
            ('Павел Федоров', 'fedorov@logistics.com', '+7 (812) 901-23-45', 'Логистика 24/7', 'Нужна система отслеживания грузов в реальном времени', 'in_progress', 'website', {'utm_source': 'direct', 'vehicles_count': '25'}),
            ('Татьяна Егорова', 'egorova@education.ru', '+7 (495) 012-34-56', 'Образование.РФ', 'Интересует система управления учебным процессом', 'new', 'webinar', {'students_count': '500', 'courses': '20'}),
            ('Николай Соколов', 'sokolov@manufacturing.ru', '+7 (499) 123-45-67', 'ПромТех', 'Автоматизация производственного учета', 'new', 'conference', {'industry': 'manufacturing', 'employees': '200'}),
            ('Виктория Лебедева', 'lebedeva@marketing.pro', '+7 (926) 234-56-78', 'МаркетПро', 'CRM для маркетингового агентства', 'completed', 'website', {'utm_source': 'facebook', 'clients_count': '30'}),
        ]
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        inserted_count = 0
        for lead_data in test_leads:
            cursor.execute(
                '''INSERT INTO leads (name, email, phone, company, message, status, source, custom_fields)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''',
                (*lead_data[:7], Json(lead_data[7]))
            )
            inserted_count += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': f'Добавлено {inserted_count} тестовых заявок',
                'count': inserted_count
            }),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Error: {str(e)}'}),
            'isBase64Encoded': False
        }
