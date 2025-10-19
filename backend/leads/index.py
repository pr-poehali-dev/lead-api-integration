'''
Business: API для получения списка лидов и управления статусами
Args: event - dict с httpMethod, queryStringParameters; context - объект с request_id
Returns: HTTP response dict со списком лидов или обновлённым лидом
'''

import json
import os
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

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
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            return get_leads(event)
        elif method == 'PUT':
            return update_lead(event)
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
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

def get_leads(event: Dict[str, Any]) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    status_filter = params.get('status')
    limit = int(params.get('limit', '100'))
    offset = int(params.get('offset', '0'))
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    query = 'SELECT * FROM leads'
    query_params = []
    
    if status_filter:
        query += ' WHERE status = %s'
        query_params.append(status_filter)
    
    query += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
    query_params.extend([limit, offset])
    
    cursor.execute(query, query_params)
    leads = cursor.fetchall()
    
    cursor.execute('SELECT COUNT(*) as total FROM leads' + (' WHERE status = %s' if status_filter else ''), 
                   [status_filter] if status_filter else [])
    total = cursor.fetchone()['total']
    
    cursor.execute('''
        SELECT status, COUNT(*) as count 
        FROM leads 
        GROUP BY status
    ''')
    stats = {row['status']: row['count'] for row in cursor.fetchall()}
    
    cursor.close()
    conn.close()
    
    for lead in leads:
        if 'created_at' in lead and lead['created_at']:
            lead['created_at'] = lead['created_at'].isoformat()
        if 'updated_at' in lead and lead['updated_at']:
            lead['updated_at'] = lead['updated_at'].isoformat()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'leads': leads,
            'total': total,
            'stats': stats,
            'limit': limit,
            'offset': offset
        }),
        'isBase64Encoded': False
    }

def update_lead(event: Dict[str, Any]) -> Dict[str, Any]:
    body_data = json.loads(event.get('body', '{}'))
    lead_id = body_data.get('id')
    new_status = body_data.get('status')
    
    if not lead_id or not new_status:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Missing id or status'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    cursor.execute(
        '''UPDATE leads 
           SET status = %s, updated_at = CURRENT_TIMESTAMP 
           WHERE id = %s 
           RETURNING *''',
        (new_status, lead_id)
    )
    
    updated_lead = cursor.fetchone()
    conn.commit()
    cursor.close()
    conn.close()
    
    if not updated_lead:
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Lead not found'}),
            'isBase64Encoded': False
        }
    
    if 'created_at' in updated_lead and updated_lead['created_at']:
        updated_lead['created_at'] = updated_lead['created_at'].isoformat()
    if 'updated_at' in updated_lead and updated_lead['updated_at']:
        updated_lead['updated_at'] = updated_lead['updated_at'].isoformat()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'lead': updated_lead
        }),
        'isBase64Encoded': False
    }
