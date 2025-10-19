'''
Business: API endpoint для приема заявок с авторизацией по X-API-Key и сохранением в БД
Args: event - dict с httpMethod, headers, body; context - объект с request_id
Returns: HTTP response dict с результатом обработки заявки
'''

import json
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr, ValidationError
from datetime import datetime
import psycopg2
from psycopg2.extras import Json

class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=2000)
    source: Optional[str] = Field(None, max_length=100)
    
    class Config:
        extra = 'allow'

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception('DATABASE_URL not configured')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    headers: Dict[str, str] = event.get('headers', {})
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
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
    
    api_key = headers.get('x-api-key') or headers.get('X-API-Key')
    expected_key = os.environ.get('API_KEY', 'demo-key')
    
    if api_key != expected_key:
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Unauthorized: Invalid API key'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        lead = LeadRequest(**body_data)
        
        custom_fields = {}
        for key, value in body_data.items():
            if key not in ['name', 'email', 'phone', 'company', 'message', 'source']:
                custom_fields[key] = value
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            '''INSERT INTO leads (name, email, phone, company, message, source, custom_fields, status)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
               RETURNING id, created_at''',
            (
                lead.name,
                lead.email,
                lead.phone,
                lead.company,
                lead.message,
                lead.source,
                Json(custom_fields),
                'new'
            )
        )
        
        lead_id, created_at = cursor.fetchone()
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
                'message': 'Заявка успешно сохранена',
                'lead_id': lead_id,
                'created_at': created_at.isoformat() if created_at else None
            }),
            'isBase64Encoded': False
        }
    
    except ValidationError as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Validation error',
                'details': e.errors()
            }),
            'isBase64Encoded': False
        }
    
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'}),
            'isBase64Encoded': False
        }
