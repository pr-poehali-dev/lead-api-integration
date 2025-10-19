'''
Business: API endpoint для приема заявок с авторизацией по X-API-Key
Args: event - dict с httpMethod, headers, body; context - объект с request_id
Returns: HTTP response dict с результатом обработки заявки
'''

import json
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr, ValidationError
from datetime import datetime

class LeadRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=50)
    company: Optional[str] = Field(None, max_length=200)
    message: Optional[str] = Field(None, max_length=2000)
    
    class Config:
        extra = 'allow'

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
        
        lead_data = lead.model_dump()
        lead_data['timestamp'] = datetime.utcnow().isoformat()
        lead_data['request_id'] = context.request_id
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Заявка успешно получена',
                'lead_id': context.request_id,
                'data': lead_data
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
