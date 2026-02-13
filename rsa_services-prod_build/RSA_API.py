from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import shutil
import smtplib
import ssl
import sys
import base64
import zipfile
from flask import Flask, jsonify, request,send_file, Response ,send_from_directory,url_for
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
import psycopg2
from datetime import datetime,timedelta, timezone
from psycopg2.extras import RealDictCursor
import uuid
import datetime as DT
import random
import string
from db_config import DB_CONFIG
from db_config import rsa_path,send_from,send_pwd
from db_config import parent_dir
import os
import json
import jwt
from flask_cors import CORS, cross_origin
import geopandas as gpd,fiona
from sqlalchemy import create_engine
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_AsGeoJSON
import pandas as pd
from PIL import Image

app = Flask(__name__)
cors = CORS(app)
Jwr = JWTManager(app)
app.config['SECRET_KEY'] = 'my_secret_key'
app.config['JWT_SECRET_KEY'] = 'jwt_secret_key'
upload_folder = r"C:\Users\CoERS_VISHAL\Documents\RSA\Images"
fiona.drvsupport.supported_drivers['kml'] = 'rw'
fiona.drvsupport.supported_drivers['KML'] = 'rw'

# Domain mapping and SSL cert usage are disabled by default in code-level.
# Set the environment variable `APP_URL` to enable links (e.g. https://example.com/app/)
APP_URL = os.environ.get('APP_URL', '#')
ORIGINAL_DOMAIN = 'https://coers.iitm.ac.in/rsa_dev/#/'

def _apply_app_url(html):
    try:
        return html.replace(ORIGINAL_DOMAIN, APP_URL)
    except Exception:
        return html

def send_mail_rsa_app(emailid,admid, admpwd,role):
  # Define the HTML document
    html = '''
        <html>
            <body>
                <p>Dear User</p>

                <p>Greetings for the Day from CoERS!</p>
            
                <p>We are thrilled to inform you that your request for access has been successfully processed. Below, you will find your login credentials: </p>
                <p>Here is the Link for <a href="https://coers.iitm.ac.in/rsa_dev/#/">RSSA</a> application. </p>
                <p> Credentials: </p>
                <p><b>User role:{{role}}</b></p>
                <p><b>Email_id:{{emailid}}</b></p>
                <p><b>User ID : {{admid}} </b></p>
                <p><b>Password : {{admpwd}} </b></p>
               <i>With Regards  </i>
               <br>
               <i>Admin</i>
               </br>
               <i>CoERS Admin</i>

            </body>
        </html>
        '''
    html = html.replace('{{admid}}',admid).replace('{{admpwd}}',admpwd).replace('{{role}}',role).replace('{{emailid}}',emailid)
    html = _apply_app_url(html)
    # Set up the email addresses and password. Please replace below with your email address and password
    # email_from = email_from
    # password = password
    email_to = emailid

    # Generate today's date to be included in the email Subject
    # date_str = pd.Timestamp.today().strftime('%Y-%m-%d')

    # Create a MIMEMultipart class, and set up the From, To, Subject fields
    email_message = MIMEMultipart()
    email_message['From'] = send_from
    email_message['To'] = email_to
    email_message['Subject'] = "[CoERS] Welcome to RSA Application: Your Login Details Inside"

    # Attach the html doc defined earlier, as a MIMEText html content type to the MIME message
   
             
            
    email_message.attach(MIMEText(html, "html"))
    # Convert it as a string
    email_string = email_message.as_string()

    # Connect to the Gmail SMTP server and Send Email
    # context = ssl.create_default_context()
    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    with smtplib.SMTP("smtp-mail.outlook.com", 587) as server:
        server.starttls(context=context)
        server.login(send_from, send_pwd)
        server.sendmail(send_from,email_to,email_string)


def postgresql_to_dataframe(conn, select_query,column_names):
    """
    Tranform a SELECT query into a pandas dataframe
    """
    cursor = conn.cursor()
    try:
        cursor.execute(select_query)
    except (Exception, psycopg2.DatabaseError) as error:
        # print("Error: %s" % error)
        cursor.close()
        return 1
   
    # Naturally we get a list of tupples
    tupples = cursor.fetchall()
    cursor.close()
   
    # We just need to turn it into a pandas dataframe
    df = pd.DataFrame(tupples, columns=column_names)
#    
    return df

def validate(params):
    error = {}
    for i in params:
        value = request.form.get(i)
        if value is None or value == "" or value == " ":
            error[i] = value
    status = error
    return status

def json_validate(params):
    error = {}
    for i in params:
        value = request.json.get(i)
        if value is None or value == "" or value == " ":
            error[i] = value
    status = error
    return status

def send_mail_rsa_otp(emailid, otp):
  # Define the HTML document
    html = '''
        <html>
            <body>
                <p>Dear User</p>

                <p>Greetings for the Day from CoERS!</p>
            
                <p>Below, you will find your otp for login: </p>
                     
                <p> OTP: </p>
                <p><b>{{otp}} </b></p>
               <i>With Regards  </i>
               <br>
               <i>Admin</i>
               </br>
               <i>CoERS Admin</i>

            </body>
        </html>
        '''
    html = html.replace('{{otp}}',otp)
    # Set up the email addresses and password. Please replace below with your email address and password
    # email_from = email_from
    # password = password
    email_to = emailid

    # Generate today's date to be included in the email Subject
    # date_str = pd.Timestamp.today().strftime('%Y-%m-%d')

    # Create a MIMEMultipart class, and set up the From, To, Subject fields
    email_message = MIMEMultipart()
    email_message['From'] = email_from
    email_message['To'] = email_to
    email_message['Subject'] = "[CoERS] Welcome to RSA Application: Your Login Details Inside"

    # Attach the html doc defined earlier, as a MIMEText html content type to the MIME message
   
             
            
    email_message.attach(MIMEText(html, "html"))
    # Convert it as a string
    email_string = email_message.as_string()

    # Connect to the Gmail SMTP server and Send Email
    # context = ssl.create_default_context()
    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    with smtplib.SMTP("smtp-mail.outlook.com", 587) as server:
        server.starttls(context=context)
        server.login(email_from, password)
        server.sendmail(email_from,email_to,email_string)

def forgot_password_mail(emailid,admpwd,name):
    html = '''
        <html>
            <body>
                <p>Hello {{name}},</p>
                <p>Greetings for the Day!</p>
                <p>     Your RSA account password and login details are shared below.</p>
                <p>     User: {{name}}</p>
                <p>         <b>Email ID:</b> {{emailid}}</p>
                <p>         <b>Password:</b> {{admpwd}}</p>
                <p><i>With Regards</i></p>
                <p><i>Admin – RSSA</i></p>
                <p><i>RSA Admin</i></p>
            </body>
        </html>
        '''
    html = html.replace('{{emailid}}',emailid).replace('{{admpwd}}',admpwd).replace('{{name}}',name)
    email_to = emailid
    email_message = MIMEMultipart()
    email_message['From'] = send_from
    email_message['To'] = email_to
    email_message['Subject'] = "[CoERS]RSA Application: Password Reset"
    email_message.attach(MIMEText(html, "html"))
    email_string = email_message.as_string()
    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    with smtplib.SMTP("smtp-mail.outlook.com", 587) as server:
        server.starttls(context=context)
        server.login(send_from, send_pwd)

def audit_assigned_mail(auditor,auditor_email,stretch_name,audit_id,start_by_date,submit_by_date):
    html = '''
        <html>
            <body>
                <p>Hello {{name}},</p>
                <p>Greetings for the Day!</p>
                <p>     An Audit has been assigned to you, Below are the audit details</p>
                <p>Here is the Link for <a href="https://coers.iitm.ac.in/rsa_dev/#/">RSSA</a> application. </p>
                <p>     <b>User: {{name}}</p></b>
                <p>         <b>Stretch Name ID:</b> {{stretch_name}}</p>
                <p>         <b>Audit ID:</b> {{audit_id}}</p>
                <p>         <b>Start Date:</b> {{start_by_date}}</p>
                <p>         <b>Submit Date:</b> {{submit_by_date}}</p>
                <p><i>With Regards</i></p>
                <p><i>Admin – RSSA</i></p>
                <p><i>RSA Admin</i></p>
            </body>
        </html>
        '''
    html = html.replace('{{stretch_name}}',stretch_name).replace('{{name}}',auditor).replace('{{audit_id}}',audit_id).replace('{{start_by_date}}',str(start_by_date)).replace('{{submit_by_date}}',str(submit_by_date))
    html = _apply_app_url(html)
    email_to = auditor_email
    email_message = MIMEMultipart()
    email_message['From'] = send_from
    email_message['To'] = email_to
    email_message['Subject'] = "[CoERS]RSSA Application: Audit Assigned Details"
    email_message.attach(MIMEText(html, "html"))
    # Convert it as a string
    email_string = email_message.as_string()

    # Connect to the Gmail SMTP server and Send Email
    # context = ssl.create_default_context()
    context = ssl.SSLContext(ssl.PROTOCOL_TLS)
    with smtplib.SMTP("smtp-mail.outlook.com", 587) as server:
        server.starttls(context=context)
        server.login(send_from, send_pwd)
        server.sendmail(send_from,email_to,email_string)

def connect(params_dic):
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        # connect to the PostgreSQL server
        # print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(**params_dic)
        
    except (Exception, psycopg2.DatabaseError) as error:
        # print(error)
        sys.exit(1)
    # print("Connection successful")
    return conn

def execute_query(query, params = None, fetch=False):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute(query, params)
        conn.commit()
        if fetch:
            result = cur.fetchall()
        else:
            result = None
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def execute_dict_query(query, params = None, fetch=False):
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            print(query,params)
            cur.execute(query, params)
            conn.commit()
            if fetch:
                result = cur.fetchall()
            else:
                result = None
            return result
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()

def new_section():
    all_sections = []
    query1 = """SELECT DISTINCT(section_id) FROM question_bank"""
    params = ()
    id = execute_query(query1,params,fetch=True)
    new_id = ""
    new_sections = []
    # print(id,'id')
    for i in id:
        # char = ord(i[0])
        all_sections.append(i[0])
        all_sections.sort()
        # new_char = (all_sections[-1])
    last = all_sections[-1]
    for i in all_sections:
        if len(i) > 1:
            new_sections.append(i)
    if new_sections != []:
        new_sections.sort()
        for i in new_sections:
            first = i[0]
            second = i[1]
            if second == 'Z':
                char = ord(first)
                new_char =  int(char) + 1
                new_first = chr(new_char)
                new_second = 'A'
                new_id = new_first + "" + new_second
            else:
                char = ord(second)
                new_char =  int(char) + 1
                new_first = first
                new_second = chr(new_char)
                new_id = new_first+""+new_second
    else:
        if last == 'Z':
            new_id = 'AA'
        else:
            char = ord(last)
            new_char =  int(char) + 1
            new_id = chr(new_char)
    section_id = new_id 
        # print(section_id)
    return section_id

@app.route('/add_users',methods = ['GET','POST'])
def add_users():
    try:
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        department = request.form.get('department')
        designation = request.form.get('designation')
        contact_number =request.form.get('contact_number')
        alternate_number = request.form.get('alternate_number')
        email_id = request.form.get('email_id')
        role = request.form.get('role')
        state = request.form.get('state')
        district = request.form.get('district')
        created_by = request.form.get('created_by')
        state_name = request.form.get('state_name')
        district_name = request.form.get('district_name')
        email_username = email_id.split('@')[0]
        random_number = ''.join(random.choices(string.digits,k=4))
        file_name = request.form.get('file_name')
        total = request.files
        login_status = 'False'
        register = 'Register'
        file_save = []
        default_role = ["Auditor","Lead Auditor","CoERS","Owner","AE","Field User"]
        if ' ' in email_username:
            return jsonify({'statusCode':400,'status':'Invalid email_id','message':'Enter valid email_id'})
        if len(contact_number) > 10 or len(alternate_number) > 10:
            return jsonify({'statusCode':400,'status':'Invalid phone number','message':'Enter valid phone number'})
        if state_name is None or state_name == "" or district_name is None or district_name == "" or file_name is None or file_name == "" or first_name == '' or first_name is None or created_by is None or created_by == "" or department is None or department == '' or designation == '' or designation is None or last_name is None or last_name == "" or contact_number is None or contact_number == '' or alternate_number == '' or alternate_number is None or email_id is None or email_id == '' or role == '' or role is None or state is None or state == '' or district is None or district == '':
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'Please fill all the details'})
        if role not in default_role:
            return jsonify({'statusCode':400,'status':'Invalid role','message':'Enter valid role'})
        else:
            if '.' not in file_name:
                return jsonify({'statusCode':400,'status':'Please mention file type'})
            if file_name.split('.')[0] is None or file_name.split('.')[0] == "" or file_name.split('.')[1] == "" or file_name.split('.')[0] is None:
                return jsonify({'statusCode':400,'status':'Invalid file_name','message':'Enter valid file_name'})
            file_type = file_name.split('.')[1]
            verify_mail = list(email_id)
            if '@' not in verify_mail or '.' not in verify_mail:
                return jsonify({'statusCode':400,'status':'Invalid email format','message':'Enter valid email format'})
            mini = """SELECT email FROM users WHERE email = %s"""
            params = (email_id,)
            email_check = execute_query(mini,params,fetch=True)
            if email_check:
                return jsonify({'statusCode':404,"status":"Email already registered",'message':'Email is already registered'})
            check = """SELECT user_id,role FROM users WHERE  user_id = %s"""
            params = (created_by,)
            data = execute_query(check,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid user_id in created_by'})
            if data[0][1] != 'Lead Auditor' and data[0][1] != 'CoERS' and data[0][1] != 'Owner':
                return jsonify({'statusCode':400,'status':'Auditor cannot create user'}) 
            # txt = email_id.split('@')
            # if '.' in txt[0]:
            #     res = email_id.split('.')
            #     uname = res[0]
            #     user_id = f"{uname[:4]}{random_number}"
            # else:
            #     user_id = f"{email_username[:4]}{random_number}"
            user_id = f"{first_name}{random_number}"
            password = ''.join(random.choices(string.ascii_lowercase+string.ascii_uppercase+string.digits,k=8))
            try:
                org_path = parent_dir + "/" + register
                bool1 = os.path.exists(org_path)
                if bool1 is False:
                    os.makedirs(org_path)
                user_path = os.path.join(org_path,str(user_id))
                bool2 = os.path.exists(user_path)
                if bool2 is False:
                    os.makedirs(user_path)
                upload_path = os.path.join(user_path,str(user_id))
                file = total.get(file_name)
                path = upload_path+"."+file_type
                file.save(path)
                file_save.append(path)
            except Exception as e:
                return jsonify({'statusCode':500,'status':'Failed','message':'Unable to store images.'})
            query = """INSERT INTO users(user_id,password,first_name,last_name,department,designation,contact_number,alternate_number,email,role,state_code,district_code,login_status,file_save,created_by,state,district) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            params = (user_id,password,first_name,last_name,department,designation,contact_number,alternate_number,email_id,role,state,district,login_status,file_save,created_by,state_name,district_name,)
            message = "Successfully Registered."
        execute_query(query,params)
        send_mail_rsa_app(email_id,user_id,password,role)
        json_response = {'user_id':user_id,'password':password}
        return jsonify({'statusCode':200,'status':'Success','message':message,'details':json_response})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/forgot_password',methods = ['GET','POST'])
def forgot_password():
    try:
        email = request.json.get('email')
        if email is None or email == "":
            return jsonify({'statusCode':400,'status':'Incomplete Details','message':'Please fill all the details'})
        # password = ''.join(random.choices(string.ascii_lowercase+string.ascii_uppercase+string.digits,k=8))
        query = """SELECT first_name,user_id,password FROM users WHERE email = %s AND delete_status is not %s"""
        params = (email,True,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':500,'status':'User data does not exist'})
        else:
            name = data[0][0]
            user_id = data[0][1]
            password = data[0][2]
            # query1 = """UPDATE users SET password = %s WHERE user_id = %s"""
            # params = (password,user_id,)
            # execute_query(query1,params)
            # forgot_password_mail(email,password,name)
            return jsonify({'statusCode':200,'status':'Success'})
    except Exception as e:
        return jsonify({"statusCode":500,"status":"Failed"+str(e)})

@app.route('/login_otp',methods=['GET','POST'])
def login_otp():
    try:
        email_id = request.json.get('email_id')
        time = request.json.get('time')
        validation = ["email_id","time"]
        check = json_validate(validation)
        if check != {}:
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statusCode":400,"status":status})
        # if ' ' in email_id: 
        #     return jsonify({'statusCode':400,'status':'Invalid email_id'})
        # verify_mail = list(email_id)
        # if '@' not in verify_mail or '.' not in verify_mail:
        #     return jsonify({'statusCode':400,'status':'Invalid email format'})
        query1 = """SELECT first_name,role,user_id,email FROM users WHERE (email = %s OR user_id = %s)"""
        params = (email_id,email_id,)
        user = execute_query(query1,params,fetch=True)
        if user == []:
            return jsonify({'statusCode':404,'status':'User does not exist'})
        chars = string.digits
        otp =  ''.join(random.choice(chars) for _ in range(4))
        ins = """INSERT INTO users_logged_in (email,otp,otp_time) VALUES (%s,%s,%s) RETURNING s_no"""
        params = (user[0][3],otp,time,)
        data = execute_query(ins,params,fetch=True)
        # send_mail_od_otp(email_id,otp)
        response = {'statusCode':200,'status':'Successfully registered user',"otp":otp,"s_no":data[0][0]}
        return response
    except Exception as e:
        response = {'statusCode':500,'status':'Failed to update data'+str(e)}
        return response

@app.route('/login',methods = ['GET','POST'])
def login():
        try:
            enter_id = request.json.get('enter_id')
            password = request.json.get('password')
            all_roles = ['CoERS','Owner','Lead Auditor','Auditor','AE']
            if enter_id == '' or enter_id is None or password is None or password == '':
                return jsonify({'statusCode':400,'status':'Please fill all the details'})
            query = """SELECT login_status FROM users WHERE (email = %s OR user_id = %s) AND password = %s"""
            params = (enter_id,enter_id,password,)
            data = execute_query(query,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid credentials'})
            # if len(data)!=0:
            #     if data[0][0] == True:
            #         return jsonify({'statusCode':300,'status':'User already logged in'})
            #     else:
            query1 = """SELECT first_name,role,user_id FROM users WHERE (email = %s OR user_id = %s) AND password = %s"""
            params = (enter_id,enter_id,password)
            user = execute_query(query1,params,fetch=True)
            DateTime = datetime.now()
            login_status = 'True'
            query2 = """INSERT INTO users_logged_in(user_id,login_status,logged_in,users) VALUES(%s,%s,%s,%s)"""
            params = (user[0][2],login_status,DateTime,user[0],)
            execute_query(query2,params)
            query3 = """UPDATE users SET login_status = %s WHERE (user_id = %s OR email = %s)"""
            params = (login_status,enter_id,enter_id,)
            execute_query(query3,params)
            query4 = """SELECT role FROM users WHERE (email = %s OR user_id = %s)"""
            params = (enter_id,enter_id,)
            role = execute_query(query4,params,fetch=True)
            # if user[0][1] == 'CoERS':
            #     all_roles
            # elif user[0][1] == 'Owner':
            #     all_roles.remove('CoERS')
            # elif user[0][1] == 'Lead Auditor':
            #     all_roles.remove('Owner')
            #     all_roles.remove('CoERS')
            # else:
            #     all_roles = []
            query6 = """SELECT created_by FROM users WHERE user_id = %s"""
            params =  (user[0][2],)
            created_by = execute_query(query6,params,fetch=True)
            if user is not None:
                return jsonify({'statusCode':200,'status':'successfully logged in',"role":user[0][1],"created_by":created_by[0][0],"user_id":user[0][2]})
            else: 
                return jsonify({'statusCode':404,'status':'User does not exist'})
        except Exception as e:
            return jsonify({'statusCode':500,'status':'Failed to login'+str(e)}) 
        
@app.route('/logout',methods = ['GET','POST'])
def logout():
        try:
            user_id = request.json.get('user_id')
            if user_id == '':
                return jsonify({'statusCode':400,'status':'Incomplete details please fill all the details','message':'Invalid userid'})
            login_status = 'False'
            check = """SELECT user_id FROM users WHERE user_id = %s"""
            params = (user_id,)
            ver = execute_query(check,params,fetch=True)
            if ver == []:
                return jsonify({'statusCode':400,'status':'Invalid user_id'})
            DateTime = datetime.now()
            query = """UPDATE users_logged_in SET logged_out = %s, login_status = %s WHERE user_id = %s"""
            params = (DateTime,login_status,user_id)
            execute_query(query,params)
            query1 = """UPDATE users SET login_status = %s WHERE user_id = %s"""
            params1 = (login_status,user_id)
            execute_query(query1,params1)
            return jsonify({'statusCode':200,'status':'logged out successfully'})
        except Exception as e:
            return jsonify({'statusCode':500,'status':'Failed to logout'})  
        
@app.route('/user_list',methods = ['GET','POST'])
def user_list():
    try:
        filter = request.json.get('filter')
        userid = request.json.get('userid')
        if filter is None or filter == "" or userid == "" or userid is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'Invalid user_role'})
        dict = {}
        param = []
        want = ""
        dict_params = []
        all_roles = ['CoERS','Owner','Lead Auditor','Auditor','AE','Field User']
        qcheck = """SELECT user_id FROM users WHERE user_id = %s"""
        params = (userid,)
        user = execute_query(qcheck,params,fetch=True)
        if user == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        for i in all_roles:
            if filter not in all_roles:
                return jsonify({'statusCode':500,'status':'Invalid role in filter'})
        basicquery = """SELECT first_name,email,designation,contact_number,department,role,district_code,state_code,user_id,created_by,state,district FROM users WHERE 1=1"""
        qrole = """SELECT role FROM users WHERE user_id = %s"""
        params = (userid,)
        role = execute_query(qrole,params,fetch=True)
        if role[0][0] == 'CoERS' and filter in all_roles:
            want = filter
            basicquery += 'AND role = %s'
            param.append(want)
        if role[0][0] == 'Owner':
            if filter == 'CoERS':
                status = 'forbidden access:{role}'.format(role=role[0][0])
                return jsonify({'statusCode':403,'status':status})
            elif filter == 'Owner':
                want = 'Owner'
                basicquery += 'AND user_id = %s'
                param.append(userid)
            elif filter == 'Lead Auditor':
                want = 'Lead Auditor'
                basicquery += 'AND role = %s'
                param.append(want)
            elif filter == 'Auditor':
                want = 'Auditor'
                basicquery += 'AND role = %s'
                param.append(want)
            elif filter == 'ae':
                want = 'AE'
                basicquery += 'AND role = %s'
                param.append(want)
            elif filter == 'Field User':
                want = 'Field User'
                basicquery += 'AND role = %s'
                param.append(want)
        if role[0][0] == 'Lead Auditor':
            if filter == 'Lead Auditor':
                basicquery += 'AND user_id = %s'
                param.append(userid) 
            if filter == "Auditor":
                basicquery += 'AND created_by = %s AND role = %s'
                param.append(userid)
                param.append('Auditor')
            elif filter == 'AE':
                want = 'AE'
                basicquery += 'AND role = %s AND created_by = %s'
                param.append(want)
                param.append(userid)
            elif filter == 'Field User':
                want = 'Field User'
                basicquery += 'AND role = %s AND created_by = %s'
                param.append(want)
                param.append(userid)
            elif filter == 'Owner' or filter == 'CoERS':
                status = 'forbidden access:{role}'.format(role=role[0][0])
                return jsonify({'statusCode':403,'status':status})
        if role[0][0] == 'Auditor':
            status = 'forbidden access:{role}'.format(role=role[0][0])
            return jsonify({'statusCode':403,'status':status})
        param = tuple(param)
        data = execute_query(basicquery,param,fetch=True)
        if data == []:
            return jsonify({'statusCode':500,'status':'Filtered data does not exist'})
        for i in data:
            dict = {    
                        "user_id":i[8],
                        "first_name":i[0],
                        "email":i[1],
                        "designation":i[2],
                        "contact_number":i[3],
                        "department":i[4],
                        "role":i[5],
                        "district":i[11],
                        "state":i[10],
                        "created_by":i[9]
                    }
            if i[5] == 'Auditor':
                get_det = """SELECT 
                            SUM(assn.stretch_length) AS total_stretch_audited, 
                            SUM(CASE WHEN assn.status IN ('Audit Completed', 'Report Submitted', 'Report Approved', 'Report Rejected') THEN assn.stretch_length END) AS completed_stretch,
                            SUM(CASE WHEN assn.status IN ('Audit Assigned', 'Accepted') THEN assn.stretch_length END) AS assigned_stretch,
                            SUM(CASE WHEN assn.status = 'In Progress' THEN assn.stretch_length END) AS in_progress_stretch,
                            COUNT(CASE WHEN assn.status IN ('Audit Completed', 'Report Submitted', 'Report Approved', 'Report Rejected') THEN 1 END) AS completed_count,
                            COUNT(CASE WHEN assn.status IN ('Audit Assigned', 'Accepted') THEN 1 END) AS assigned_count,
                            COUNT(CASE WHEN assn.status = 'In Progress' THEN 1 END) AS inprogress_count
                        FROM audit_assignment assn
                        INNER JOIN users us ON us.user_id = assn.auditor
                        INNER JOIN audit_plan ap ON ap.audit_type_id = assn.audit_type_id
                        WHERE us.user_id = %s"""
                params = (i[8],)
                aud_det = execute_query(get_det,params,fetch=True)
                q_upcoming = """SELECT audit_id FROM audit_assignment WHERE status = %s AND auditor = %s"""
                params = ('Audit Assigned',i[8],)
                d = execute_query(q_upcoming,params,fetch=True)
                q_inp = """SELECT audit_id FROM audit_assignment WHERE status = %s AND auditor = %s"""
                params = ('In progress',i[8],)
                d_inp = execute_query(q_inp,params,fetch=True)
                if d == []:
                    dict['upcoming_audit'] = None
                else:
                    dict["upcoming_audit"] = d[0][0]
                if d_inp == []:
                    dict['current_audit'] = None
                else:
                    dict["current_audit"] = d_inp[0][0]
                dict["kms_audited"] = aud_det[0][1]
                dict["audit_completed"] = aud_det[0][4]
                dict["pending"] = aud_det[0][6]
            dict_params.append(dict)
            # print(dict_params)
            dict = {}
        return jsonify({'statusCode':200,'status':'Success',"details":dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)}) 
    
#audit type section
@app.route('/audit_type',methods = ['GET','POST'])
def audit_type():
        try:
            stretch_name = request.json.get('stretch_name')
            road_type_id = request.json.get('road_type_id')
            stage_id = request.json.get('stage_id')
            section_ids = request.json.get('section_ids')
            created_by = request.json.get('created_by')
            audit_method = request.json.get('audit_method')
            created_on = request.json.get('created_on')
            template = request.json.get('template')
            id = ''.join(random.choices(string.digits,k=4))
            format_data = "%d-%m-%Y"
            created_on = datetime.strptime(created_on, format_data)
            status = 'Type'
            road_types = []
            audit_method_types = []
            all_sections = []
            dummy = []
            if stretch_name is None or stretch_name == "" or road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or section_ids == "" or  section_ids is None or created_by is None or created_by == "" or audit_method is None or audit_method == "" or created_on is None or created_on == "" or template is None or template == "":
                return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
            else:    
                check = """SELECT user_id,role FROM users WHERE  user_id = %s"""
                params = (created_by,)
                data = execute_query(check,params,fetch=True)
                if data == []:
                    return jsonify({'statusCode':400,'status':'Invalid user_id in created_by'})
                if data[0][1] != 'Lead Auditor' and data[0][1] != 'CoERS' and data[0][1] != 'Owner':
                    return jsonify({'statusCode':400,'status':'Auditor cannot create user'}) 
                if type(section_ids) != list:
                    return jsonify({'statusCode':400,'status':'Invalid input type for section_ids'})
                if template == 'True' or template == True:
                    template_id = f"{stretch_name}{id}"
                    query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
                    params = (road_type_id,)
                    road_type = execute_query(query0,params,fetch=True)
                    if road_type == []:
                        return jsonify({'statusCode':400,'status':'Invalid road_type'})
                    method_query = """SELECT audit_method_dd FROM dropdown_values"""
                    params = ()
                    data2 = execute_query(method_query,params,fetch=True)
                    for i in data2:
                        if i[0] is not None:
                            audit_method_types.append(i[0])
                    section_fetch = """SELECT DISTINCT(section_id) FROM question_bank"""
                    params = ()
                    data3 = execute_query(section_fetch,params,fetch=True)
                    for i in data3:
                        if i[0] is not None:
                            all_sections.append(i[0])
                    for j in section_ids:
                        if j not in all_sections:
                            return jsonify({'statusCode':400,'status':'Invalid section'})
                        else:
                            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s AND road_type_id = %s AND stage_id = %s"""
                            params = (j,road_type_id,stage_id)
                            data = execute_query(mini,params,fetch=True)
                            dummy.append(data[0][0])
                    stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
                    params = (stage_id,)
                    stage = execute_query(stage_query,params,fetch=True)
                    if stage == []:
                        return jsonify({'statusCode':400,'status':'Invalid stage'})
                    if audit_method not in audit_method_types:
                        return jsonify({'statusCode':400,'status':'Invalid audit_method'})
                    if stretch_name == "" or road_type_id == "" or stage_id == "" or section_ids == "" or created_by == "" or audit_method == "":
                        return jsonify({'statusCode':400,'status':"Pleases fill all the details"})
                    delete_status = 'False'
                    query = """INSERT INTO template (template_id,stretch_name,road_type,stage,sections,created_by,created_on,delete_status,audit_method,road_type_id,stage_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                    params = (template_id,stretch_name,road_type[0][0],stage[0][0],dummy,created_by,created_on,delete_status,audit_method,road_type_id,stage_id,)
                    execute_query(query,params)
                    # query = """SELECT sections FROM audit_type WHERE name_of_audit = %s"""
                    # params = (stretch_name,)
                    # execute_query(query,params)
                    return jsonify({'statusCode':200,'status':'Audit type template created successfully','details':template_id})
                else:
                    audit_type_id = f"{stretch_name}{id}"
                    query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
                    params = (road_type_id,)
                    road_type = execute_query(query0,params,fetch=True)
                    if road_type == []:
                        return jsonify({'statusCode':400,'status':'Invalid road_type'})
                    method_query = """SELECT audit_method_dd FROM dropdown_values"""
                    params = ()
                    data2 = execute_query(method_query,params,fetch=True)
                    for i in data2:
                        if i[0] is not None:
                            audit_method_types.append(i[0])
                    section_fetch = """SELECT DISTINCT(section_id) FROM question_bank"""
                    params = ()
                    data3 = execute_query(section_fetch,params,fetch=True)
                    for i in data3:
                        if i[0] is not None:
                            all_sections.append(i[0])
                    for j in section_ids:
                        if j not in all_sections:
                            return jsonify({'statusCode':400,'status':'Invalid section'})
                        else:
                            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s AND road_type_id = %s AND stage_id = %s"""
                            params = (j,road_type_id,stage_id)
                            data = execute_query(mini,params,fetch=True)
                            dummy.append(data[0][0])
                    stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
                    params = (stage_id,)
                    stage = execute_query(stage_query,params,fetch=True)
                    if stage == []:
                        return jsonify({'statusCode':400,'status':'Invalid stage'})
                    if audit_method not in audit_method_types:
                        return jsonify({'statusCode':400,'status':'Invalid audit_method'})
                    if stretch_name == "" or road_type_id == "" or stage_id == "" or section_ids == "" or created_by == "" or audit_method == "":
                        return jsonify({'statusCode':400,'status':"Pleases fill all the details"})
                    delete_status = 'False'
                    query = """INSERT INTO audit_type (audit_type_id,stretch_name,road_type,stage,sections,created_by,created_on,delete_status,audit_method,status) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                    params = (audit_type_id,stretch_name,road_type[0][0],stage[0][0],dummy,created_by,created_on,delete_status,audit_method,status,)
                    execute_query(query,params)
                    # query = """SELECT sections FROM audit_type WHERE name_of_audit = %s"""
                    # params = (stretch_name,)
                    # execute_query(query,params)
                    return jsonify({'statusCode':200,'status':'Audit type created successfully','details':audit_type_id})
        except Exception as e:
            return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/sections_filter',methods=['GET','POST'])
def sections_filter():
    try:
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        audit_method = request.json.get('audit_method')
        param = []
        dummy = {}
        want = ""
        basic_query = """SELECT section_id,section FROM question_bank WHERE 1=1"""
        methods = ['inventory','issue']
        if road_type_id is not None and road_type_id != "":
            check1 = """SELECT road_type_id FROM dropdown_values WHERE road_type_id = %s"""
            params = (road_type_id,)
            data = execute_query(check1,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
            param.append(road_type_id)
            basic_query += "AND road_type_id = %s"
        if stage_id is not None and stage_id != "":
            check2 = """SELECT stage_id FROM dropdown_values WHERE stage_id = %s"""
            params = (stage_id,)
            data1 = execute_query(check2,params,fetch=True)
            if data1 == []:
                return jsonify({'statusCode':400,'status':'Invalid stage_id'})
            param.append(stage_id)
            basic_query += "AND stage_id = %s"
        if audit_method is not None and audit_method != "":
            audit_method = audit_method.lower()
            if audit_method not in methods:
                return jsonify({'statusCode':400,'status':'Invalid audit_method'})
            if audit_method in methods:
                audit_method = audit_method.lower()
                if audit_method == 'inventory':
                    # want = 'Yes'
                    my_list = ('Yes','No')
                    basic_query += "AND issues_list IN %s"
                    param.append(my_list)
                elif audit_method == 'issue':
                    want = 'Yes'
                    basic_query += "AND issues_list = %s"
                    param.append(want)
        params = tuple(param)
        data2 = execute_query(basic_query,params,fetch=True)
        if data2 == []:
            return jsonify({'statusCode':404,'status':'Filtered data does not exist'})
        qselect = """SELECT section_id,section FROM question_bank WHERE section_id IN %s"""
        params = (('A','B'),)
        qget = execute_query(qselect,params,fetch=True)
        for i in data2:
            dummy[i[0]] = i[1]
        for i in qget:
            if i[0] not in dummy:
                dummy[i[0]] = i[1]
        return jsonify({'statusCode':200,'status':'Success','sections':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})    

@app.route('/dropdowns',methods = ['GET','POST'])
def dropdowns():
    try:
        road_types = {}
        stage_types = {}
        audit_method_types = []
        user_dict = {}
        user_dict_params = []
        type_of_audits = []
        sections = {}
        data_type = []
        rt = []
        st = []
        audit_type_id = {}
        functionality = []
        master_table = []
        field_type = []
        audit_types = []
        road_owning_agency = []
        q_field_type = []
        q_data_type = []
        role = 'Auditor'
        query = """SELECT DISTINCT(road_type_id),road_type FROM question_bank"""
        params = ()
        data = execute_query(query,params,fetch=True)
        # for i in data:
        #     if i[0] is not None:
        #         road_types[i[0]] = i[1]
        #         rt.append(i[0])
        query2 = """SELECT DISTINCT(stage_id),stage_dd FROM dropdown_values"""
        params = ()
        data1 = execute_query(query2,params,fetch=True)
        for i in data1:
            if i[0] is not None:
                stage_types[i[0]] = i[1]
                st.append(i[0])
        query3 = """SELECT audit_method_dd,type_of_audit FROM dropdown_values"""
        params = ()
        data2 = execute_query(query3,params,fetch=True)
        query4 = """SELECT user_id,first_name FROM users WHERE role = %s"""
        params = (role,)
        data3 = execute_query(query4,params,fetch=True)
        for i in data3:
            user_dict[i[0]] = i[1]
        query5 = """SELECT s_no,type_of_audit,data_type,functionality,master_table,field_type FROM dropdown_values"""
        params = ()
        data5 = execute_query(query5,params,fetch=True)
        query6 = """SELECT audit_type_id,stretch_name FROM audit_type"""
        params = ()
        data6 = execute_query(query6,params,fetch=True)
        query7 = """SELECT road_owning_agency FROM dropdown_values"""
        params = ()
        data7 = execute_query(query7,params,fetch=True)
        query8 = """SELECT DISTINCT(data_type) FROM dropdown_values"""
        params = ()
        data8 = execute_query(query8,params,fetch=True)
        query9 = """SELECT DISTINCT(field_type) FROM question_bank"""
        params = ()
        data9 = execute_query(query9,params,fetch=True)
        query10 = """SELECT DISTINCT(audit_type) FROM dropdown_values"""
        params = ()
        data10 = execute_query(query10,params,fetch=True)
        if data8 == []:
            return jsonify({'statusCode':404,'status':'data_type data does not exist'})
        if data9 == []:
            return jsonify({'statusCode':404,'status':'field_type data does not exist'})
        if data10 == []:
            return jsonify({'statusCode':404,'status':'audit_type data does not exist'})
        for i in data8:
            q_data_type.append(i[0])
        for i in data9:
            if i[0] is not None:
                q_field_type.append(i[0])
        for i in data10:
            if i[0] is not None:
                audit_types.append(i[0])
        for i in data2:
            if i[0] is not None:
                audit_method_types.append(i[0])
        for i in data6:
            if i[0] is not None and i[1] is not None:
                audit_type_id[i[0]] = i[1]
        for i in data:
            if i[0] is not None:
                road_types[i[0]] = i[1]
            rt.append(i[0])
        for i in data5:
            if i[1] is not None:
                type_of_audits.append(i[1])
            if i[1] is not None:
                data_type.append(i[1])
            if i[2] is not None:
                functionality.append(i[2])
            if i[3] is not None:
                master_table.append(i[3])
            if i[4] is not None:
                field_type.append(i[4])
        for i in data7:
            if i[0] is not None:
                road_owning_agency.append(i[0])
        query6 = """SELECT DISTINCT(section_id), section FROM question_bank"""
        params = ()
        section_id = execute_query(query6,params,fetch=True)
        for i in section_id:
            sections[i[0]] = i[1]
        return jsonify({'statusCode':200,'status':'Success','audit_types':audit_types,'q_field_type':q_field_type,'q_data_type':q_data_type,'audit_method_types':audit_method_types,'stage_types':stage_types,'road_types':road_types, "auditor_name":user_dict,"types_of_audit":type_of_audits,"sections":sections,'road_type_id':rt,"stage_type_id":st,"data_type":data_type,"functionality":functionality,"master_table":master_table,"field_type":field_type,"audit_type_id":audit_type_id,'road_owning_agency':road_owning_agency})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})
    
@app.route('/audit_type_list',methods = ['GET','POST'])
def audit_type_list():
    try:
        dict = {}
        dict_params = []
        query = """SELECT audit_type_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage FROM audit_type"""
        params = ()
        data = execute_query(query,params,fetch = True)
        for i in data:
            dict = { "audit_type_id":i[0],
                        "stretch_name":i[1],
                        "road_type":i[2],
                        "audit_method":i[3],
                        "sections":i[4],
                        "created_on":i[5],
                        "created_by":i[6],
                        "stage":i[7]
                    }
            dict_params.append(dict)
        dict = {}
        return jsonify({'statusCode':200,'status':'Success',"details":dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'}) 

@app.route('/template_get',methods = ['GET','POST'])
def template_get():
    try:
        template_id = request.json.get('template_id')
        if template_id is None or template_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        template = {}
        template_dict_params = []
        query0 = """SELECT template_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage,stage_id,road_type_id
          FROM template WHERE template_id = %s"""
        params = (template_id,)
        data = execute_query(query0,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid template_id','message':'Invalid template_id'})
        for i in data:
            template = {
                        "template_id":i[0],
                        "stretch_name":i[1],
                        "road_type":i[2],
                        "audit_method":i[3],
                        "sections":i[4],
                        "created_on":i[5],
                        "created_by":i[6],
                        "stage":i[7],
                        "stage_id":i[8],
                        "road_type_id":i[9]

                    }
            template_dict_params.append(template)
        template = {} 
        return jsonify({'statusCode':200,'status':'Success','details':template_dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'})
    
# @app.route('/audit_section_old',methods = ['GET','POST'])
# def audit_section_old():
#     try:    
#         type_dict = {}
#         type_dict_params = []
#         plan_dict = {}
#         plan_dict_params = []
#         assign_dict = {}
#         assign_dict_params = []
#         template = {}
#         template_dict_params = []
#         submitted_dict = {}
#         submitted_params = []
#         approved_dict = {}
#         approved_params = []
#         rejected_dict = {}
#         rejected_params = []
#         submit_status = 'Audit Completed'
#         approve_status = 'Report Approved'
#         reject_status = 'Report Rejected'
#         query0 = """SELECT template_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage FROM template"""
#         params = ()
#         data = execute_query(query0,params,fetch = True)
#         if data == []:
#             template_dict_params = []
#         for i in data:
#             if i is not None:
#                 template = {
#                             "template_id":i[0],
#                             "stretch_name":i[1],
#                             "road_type":i[2],
#                             "audit_method":i[3],
#                             "sections":i[4],
#                             "created_on":i[5],
#                             "created_by":i[6],
#                             "stage":i[7]
#                         }
#             template_dict_params.append(template)
#         template = {}
#         query = """SELECT audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,created_on,updated_by,audit_plan_id,status FROM audit_plan"""
#         params = ()
#         data0 = execute_query(query,params,fetch=True)
#         if data0 == []:
#             plan_dict_params = []
#         for i in data0:
#             if i[18] == 'Plan':
#                 if i is not None:
#                     plan_dict = { 
#                                 "audit_type_id":i[0],
#                                 "stretch_name":i[1],
#                                 "state":i[2],
#                                 "district":i[3],
#                                 "name_of_road":i[4],
#                                 "road_number":i[5],
#                                 "no_of_lanes":i[6],
#                                 "road_owning_agency":i[7],
#                                 "chainage_start":i[8],
#                                 "chainage_end":i[9],
#                                 "location_start":i[10],
#                                 "location_end":i[11],
#                                 "latitude_start":i[12],
#                                 "latitude_end":i[13],
#                                 "stretch_length":i[14],
#                                 "created_on":i[15],
#                                 "updated_by":i[16],
#                                 "audit_plan_id":i[17],
#                                 "status":i[18]
#                             }
#                 plan_dict_params.append(plan_dict)
#         plan_dict = {}
#         query1 = """SELECT audit_type_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage,status FROM audit_type"""
#         params = ()
#         data1 = execute_query(query1,params,fetch = True)
#         if data1 == []:
#             type_dict_params = []
#         for i in data1:
#             if i[8] == 'Type':
#                 type_dict = {
#                             "audit_type_id":i[0],
#                             "stretch_name":i[1],
#                             "road_type":i[2],
#                             "audit_method":i[3],
#                             "sections":i[4],
#                             "created_on":i[5],
#                             "created_by":i[6],
#                             "stage":i[7],
#                             "status":i[8]
#                         }
#                 type_dict_params.append(type_dict)
#         type_dict = {}
#         query2 = """SELECT audit_type_id,stretch_name,start_date,submit_date,auditor,type_of_audit,audit_plan_id,audit_id,created_by,started_on,submitted_on,status,auditor_stretch FROM audit_assignment"""
#         params = ()
#         data2 = execute_query(query2,params,fetch = True)
#         if data2 == []:
#             assign_dict_params = []
#         # print('data',data)
#         for i in data2:
#             print('dict',i[12])
#             assign_dict = { 
#                         "audit_type_id":i[0],
#                         "stretch_name":i[1],
#                         "start_date":i[2],
#                         "submit_date":i[3],
#                         "auditor":i[4],
#                         "type_of_audit":i[5],
#                         "audit_plan_id":i[6],
#                         "audit_id":i[7],
#                         "created_by":i[8],
#                         "started_on":i[9],
#                         "submitted_on":i[10],
#                         "status":i[11],
#                         "auditor_stretch":i[12]
#                     }
#             assign_dict_params.append(assign_dict)
#         assign_dict = {}
#         query3 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
#                     audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
#                     ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
#                     FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s"""
#         params = (submit_status,)
#         sub_data = execute_query(query3,params,fetch = True)
#         if sub_data == []:
#             submitted_params = []
#         for i in sub_data:
#             submitted_dict = { 
#                         "audit_type_id":i[0],
#                         "stretch_name":i[1],
#                         "start_date":i[2],
#                         "submit_date":i[3],
#                         "auditor":i[4],
#                         "type_of_audit":i[5],
#                         "audit_plan_id":i[6],
#                         "audit_id":i[7],
#                         "created_by":i[8],
#                         "started_on":i[9],
#                         "submitted_on":i[10],
#                         "status":i[12],
#                         "auditor_stretch":i[11]
#                     }
#             submitted_params.append(submitted_dict)
#         submitted_dict = {}
#         query3 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
#                     audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
#                     ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
#                     FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s"""
#         params = (approve_status,)
#         sub_data1 = execute_query(query3,params,fetch = True)
#         if sub_data1 == []:
#             approved_params = []
#         for i in sub_data1:
#             approved_dict = { 
#                         "audit_type_id":i[0],
#                         "stretch_name":i[1],
#                         "start_date":i[2],
#                         "submit_date":i[3],
#                         "auditor":i[4],
#                         "type_of_audit":i[5],
#                         "audit_plan_id":i[6],
#                         "audit_id":i[7],
#                         "created_by":i[8],
#                         "started_on":i[9],
#                         "submitted_on":i[10],
#                         "status":i[12],
#                         "auditor_stretch":i[11]
#                     }
#             approved_params.append(approved_dict)
#         submitted_dict = {}
#         query3 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
#                     audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
#                     ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
#                     FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s"""
#         params = (reject_status,)
#         sub_data2 = execute_query(query3,params,fetch = True)
#         if sub_data2 == []:
#             rejected_params = []
#         for i in sub_data2:
#             rejected_dict = { 
#                         "audit_type_id":i[0],
#                         "stretch_name":i[1],
#                         "start_date":i[2],
#                         "submit_date":i[3],
#                         "auditor":i[4],
#                         "type_of_audit":i[5],
#                         "audit_plan_id":i[6],
#                         "audit_id":i[7],
#                         "created_by":i[8],
#                         "started_on":i[9],
#                         "submitted_on":i[10],
#                         "status":i[12],
#                         "auditor_stretch":i[11]
#                     }
#             rejected_params.append(rejected_dict)
#         rejected_dict = {}
#         return jsonify({'statusCode':200,'status':'Success',"audit_type_list":type_dict_params,"audit_plan_list":plan_dict_params,"assigned_audit_list":assign_dict_params,"template_list":template_dict_params,"submitted_audit_list":submitted_params,"approved_audit_list":approved_params,"rejected_audit_list":rejected_params})
#     except Exception as e:
#         return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/audit_section',methods = ['GET','POST'])
def audit_section():
    try:
        user_id = request.json.get('user_id')
        type_dict = {}
        type_dict_params = []
        plan_dict = {}
        plan_dict_params = []
        assign_dict = {}
        assign_dict_params = []
        template = {}
        template_dict_params = []
        submitted_dict = {}
        submitted_params = []
        approved_dict = {}
        approved_params = []
        rejected_dict = {}
        rejected_params = []
        submit_status = 'Report Submitted'
        approve_status = 'Report Approved'
        reject_status = 'Report Rejected'
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details fill all the data'})
        role = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        role_data = execute_query(role,params,fetch=True)
        if role_data[0][0] == 'CoERS':
            query0 = """SELECT template_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage FROM template"""
            params0 = ()
            query = """SELECT audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,created_on,updated_by,audit_plan_id,status FROM audit_plan"""
            params1 = ()
            query1 = """SELECT audit_type_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage,status FROM audit_type"""
            params2 = ()
            query2 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,
            audit_assignment.auditor,audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id,audit_assignment.created_by,audit_assignment.started_on,
            audit_assignment.submitted_on,audit_assignment.status,audit_assignment.auditor_stretch,users.first_name FROM audit_assignment 
            INNER JOIN users ON users.user_id = audit_assignment.auditor WHERE audit_assignment.status IN %s"""
            params3 = (('Audit Assigned','Audit Completed','Audit Started'),)
            query3 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                    audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
                    ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status
                    FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s"""
            params4 = (submit_status,)
            query4 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                    audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
                    ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
                    FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s"""
            params5 = (approve_status,)
            query5 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                    audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
                    ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
                    FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s"""
            params6 = (reject_status,)
        elif role_data[0][0] == 'Owner':
            query0 = """SELECT template_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage FROM template WHERE 
            created_by IN (SELECT user_id FROM users WHERE created_by IN (
            SELECT user_id FROM users WHERE user_id = %s        
            UNION
            SELECT user_id FROM users WHERE created_by = %s     
            UNION
            SELECT user_id FROM users
            WHERE created_by IN (
                SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                )                                                    
              )
            )"""
            params0 = (user_id,user_id,user_id)
            query = """SELECT audit_type_id, stretch_name, state, district, name_of_road,
                        road_number, no_of_lanes, road_owning_agency,
                        chainage_start, chainage_end, location_start, location_end,
                        latitude_start, latitude_end, stretch_length,
                        created_on, updated_by, audit_plan_id, status
                    FROM audit_plan
                    WHERE updated_by IN (
                        SELECT user_id FROM users WHERE user_id = %s
                        UNION
                        SELECT user_id FROM users WHERE created_by = %s
                        UNION
                        SELECT user_id FROM users
                        WHERE created_by IN (
                            SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                      )
                    )"""
            params1 = (user_id,user_id,user_id)
            query1 = """SELECT audit_type_id, stretch_name, road_type, audit_method,
                            sections, created_on, created_by, stage, status
                        FROM audit_type
                        WHERE created_by IN (
                            SELECT user_id FROM users WHERE user_id = %s
                            UNION
                            SELECT user_id FROM users WHERE created_by = %s
                            UNION
                            SELECT user_id FROM users
                            WHERE created_by IN (
                                SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                            )
                        )"""
            params2 = (user_id,user_id,user_id)
            query2 = """SELECT aa.audit_type_id, aa.stretch_name, aa.start_date, aa.submit_date,
                            aa.auditor, aa.type_of_audit, aa.audit_plan_id, aa.audit_id,
                            aa.created_by, aa.started_on, aa.submitted_on,
                            aa.status, aa.auditor_stretch, u.first_name
                        FROM audit_assignment aa
                        INNER JOIN users u ON u.user_id = aa.auditor
                        WHERE aa.created_by IN (
                            SELECT user_id FROM users WHERE user_id = %s
                            UNION
                            SELECT user_id FROM users WHERE created_by = %s
                            UNION
                            SELECT user_id FROM users
                            WHERE created_by IN (
                                SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                            )
                        )
                        AND aa.status IN ('Audit Assigned','Audit Started','Audit Completed')"""
            params3 = (user_id,user_id,user_id,)
            query3 = """SELECT aa.audit_type_id, aa.stretch_name, aa.start_date, aa.submit_date,
                            aa.auditor, aa.type_of_audit, aa.audit_plan_id, aa.audit_id,
                            aa.created_by, aa.started_on, aa.submitted_on,
                            aa.auditor_stretch, r.status
                        FROM audit_assignment aa
                        INNER JOIN report r ON aa.audit_id = r.audit_id
                        WHERE aa.created_by IN (
                            SELECT user_id FROM users WHERE user_id = %s
                            UNION
                            SELECT user_id FROM users WHERE created_by = %s
                            UNION
                            SELECT user_id FROM users
                            WHERE created_by IN (
                                SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                            )
                        )
                        AND r.status = 'Report Submitted'"""
            params4 = (user_id,user_id,user_id)
            query4 = """SELECT aa.audit_type_id, aa.stretch_name, aa.start_date, aa.submit_date,
                            aa.auditor, aa.type_of_audit, aa.audit_plan_id, aa.audit_id,
                            aa.created_by, aa.started_on, aa.submitted_on,
                            aa.auditor_stretch, r.status
                        FROM audit_assignment aa
                        INNER JOIN report r ON aa.audit_id = r.audit_id
                        WHERE aa.created_by IN (
                            SELECT user_id FROM users WHERE user_id = %s
                            UNION
                            SELECT user_id FROM users WHERE created_by = %s
                            UNION
                            SELECT user_id FROM users
                            WHERE created_by IN (
                                SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                            )
                        )
                        AND r.status = 'Report Approved'"""
            params5 = (user_id,user_id,user_id)
            query5 = """SELECT aa.audit_type_id, aa.stretch_name, aa.start_date, aa.submit_date,
                            aa.auditor, aa.type_of_audit, aa.audit_plan_id, aa.audit_id,
                            aa.created_by, aa.started_on, aa.submitted_on,
                            aa.auditor_stretch, r.status
                        FROM audit_assignment aa
                        INNER JOIN report r ON aa.audit_id = r.audit_id
                        WHERE aa.created_by IN (
                            SELECT user_id FROM users WHERE user_id = %s
                            UNION
                            SELECT user_id FROM users WHERE created_by = %s
                            UNION
                            SELECT user_id FROM users
                            WHERE created_by IN (
                                SELECT user_id FROM users WHERE role = 'Lead Auditor' AND created_by = %s
                            )
                        )
                        AND r.status = 'Report Rejected'"""
            params6 = (user_id,user_id,user_id)
        elif role_data[0][0] == 'Lead Auditor':
            query0 = """SELECT template_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage FROM template WHERE created_by = %s"""
            params0 = (user_id,)
            query = """SELECT audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,
            location_end,latitude_start,latitude_end,stretch_length,created_on,updated_by,audit_plan_id,status FROM audit_plan
            WHERE updated_by = %s"""
            params1 = (user_id, )
            query1 = """SELECT audit_type_id,stretch_name,road_type,audit_method,sections,created_on,created_by,stage,status FROM audit_type
            WHERE created_by = %s"""
            params2 = (user_id,)
            query2 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,
            audit_assignment.auditor,audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id,audit_assignment.created_by,audit_assignment.started_on,
            audit_assignment.submitted_on,audit_assignment.status,audit_assignment.auditor_stretch,users.first_name FROM audit_assignment 
            INNER JOIN users ON users.user_id = audit_assignment.auditor WHERE audit_assignment.created_by = %s AND audit_assignment.status IN %s"""
            params3 = (user_id,('Audit Assigned','Audit Completed','Audit Started'),)
            query3 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                    audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
                    ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
                    FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s
                    AND audit_assignment.created_by = %s"""
            params4 = (submit_status,user_id,)
            query4 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                    audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
                    ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
                    FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s
                    AND audit_assignment.created_by = %s"""
            params5 = (approve_status,user_id,)
            query5 = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                    audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id
                    ,audit_assignment.created_by,audit_assignment.started_on,audit_assignment.submitted_on,audit_assignment.auditor_stretch,report.status 
                    FROM audit_assignment INNER JOIN report ON audit_assignment.audit_id = report.audit_id WHERE audit_assignment.status = %s
                    AND audit_assignment.created_by = %s"""
            params6 = (reject_status,user_id,)
        data = execute_query(query0,params0,fetch = True)
        data0 = execute_query(query,params1,fetch=True)
        data1 = execute_query(query1,params2,fetch = True)
        
        data2 = execute_query(query2,params3,fetch = True)
        
        sub_data = execute_query(query3,params4,fetch = True)
        
        sub_data1 = execute_query(query4,params5,fetch = True)
        
        sub_data2 = execute_query(query5,params6,fetch = True)
        if data == []:
            template_dict_params = []
        for i in data:
            if i is not None:
                template = {
                            "template_id":i[0],
                            "stretch_name":i[1],
                            "road_type":i[2],
                            "audit_method":i[3],
                            "sections":i[4],
                            "created_on":i[5],
                            "created_by":i[6],
                            "stage":i[7]
                        }
            template_dict_params.append(template)
        template = {}
        if data0 == []:
            plan_dict_params = []
        for i in data0:
            if i[18] == 'Audit Planned':
                if i is not None:
                    plan_dict = { 
                                "audit_type_id":i[0],
                                "stretch_name":i[1],
                                "state":i[2],
                                "district":i[3],
                                "name_of_road":i[4],
                                "road_number":i[5],
                                "no_of_lanes":i[6],
                                "road_owning_agency":i[7],
                                "chainage_start":i[8],
                                "chainage_end":i[9],
                                "location_start":i[10],
                                "location_end":i[11],
                                "latitude_start":i[12],
                                "latitude_end":i[13],
                                "stretch_length":i[14],
                                "created_on":i[15],
                                "updated_by":i[16],
                                "audit_plan_id":i[17],
                                "status":i[18]
                            }
                plan_dict_params.append(plan_dict)
        plan_dict = {}
        if data1 == []:
            type_dict_params = []
        for i in data1:
            if i[8] == 'Type':
                type_dict = {
                            "audit_type_id":i[0],
                            "stretch_name":i[1],
                            "road_type":i[2],
                            "audit_method":i[3],
                            "sections":i[4],
                            "created_on":i[5],
                            "created_by":i[6],
                            "stage":i[7],
                            "status":i[8]
                        }
                type_dict_params.append(type_dict)
        type_dict = {}
        if data2 == []:
            assign_dict_params = []
        for i in data2:
            assign_dict = { 
                        "audit_type_id":i[0],
                        "stretch_name":i[1],
                        "start_date":i[2],
                        "submit_date":i[3],
                        "auditor":i[4],
                        "type_of_audit":i[5],
                        "audit_plan_id":i[6],
                        "audit_id":i[7],
                        "created_by":i[8],
                        "started_on":i[9],
                        "submitted_on":i[10],
                        "status":i[11],
                        "auditor_stretch":i[12],
                        "auditor_name":i[13]
                    }
            assign_dict_params.append(assign_dict)
        assign_dict = {}
        if sub_data == []:
            submitted_params = []
        for i in sub_data:
            submitted_dict = { 
                        "audit_type_id":i[0],
                        "stretch_name":i[1],
                        "start_date":i[2],
                        "submit_date":i[3],
                        "auditor":i[4],
                        "type_of_audit":i[5],
                        "audit_plan_id":i[6],
                        "audit_id":i[7],
                        "created_by":i[8],
                        "started_on":i[9],
                        "submitted_on":i[10],
                        "status":i[12],
                        "auditor_stretch":i[11]
                    }
            submitted_params.append(submitted_dict)
        submitted_dict = {}
        if sub_data1 == []:
            approved_params = []
        for i in sub_data1:
            approved_dict = { 
                        "audit_type_id":i[0],
                        "stretch_name":i[1],
                        "start_date":i[2],
                        "submit_date":i[3],
                        "auditor":i[4],
                        "type_of_audit":i[5],
                        "audit_plan_id":i[6],
                        "audit_id":i[7],
                        "created_by":i[8],
                        "started_on":i[9],
                        "submitted_on":i[10],
                        "status":i[12],
                        "auditor_stretch":i[11]
                    }
            approved_params.append(approved_dict)
        submitted_dict = {}
        if sub_data2 == []:
            rejected_params = []
        for i in sub_data2:
            rejected_dict = { 
                        "audit_type_id":i[0],
                        "stretch_name":i[1],
                        "start_date":i[2],
                        "submit_date":i[3],
                        "auditor":i[4],
                        "type_of_audit":i[5],
                        "audit_plan_id":i[6],
                        "audit_id":i[7],
                        "created_by":i[8],
                        "started_on":i[9],
                        "submitted_on":i[10],
                        "status":i[12],
                        "auditor_stretch":i[11]
                    }
            rejected_params.append(rejected_dict)
        rejected_dict = {}
        return jsonify({'statusCode':200,'status':'Success',"audit_type_list":type_dict_params,"audit_plan_list":plan_dict_params,"assigned_audit_list":assign_dict_params,"template_list":template_dict_params,"submitted_audit_list":submitted_params,"approved_audit_list":approved_params,"rejected_audit_list":rejected_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/section_questions',methods = ['GET','POST'])
def section_questions():
    try:
        audit_type_id = request.json.get('audit_type_id')
        template = request.json.get('template')
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        dict = {}
        dict_params = []
        result_dict = {}
        q_wise = {}
        qid = []
        issue_list = ""
        default = ['True','False',True,False,'true','false']
        if audit_type_id is None or audit_type_id == "" or template is None or template == "" or road_type_id == "" or road_type_id is None or stage_id is None or stage_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details fill all the data'})
        if template not in default:
                return jsonify({'statusCode':400,'status':'Invalid input for template'})
        if template == 'True' or template == True:
                mini = """SELECT template_id,audit_method FROM template WHERE template_id = %s"""
                params = (audit_type_id,)
                id = execute_query(mini,params,fetch=True)
                if id == []:
                    return jsonify({'statusCode':400,'status':'Invalid template_id'})
                query = """SELECT sections FROM template WHERE template_id = %s"""
                params = (audit_type_id,)
                sections = execute_query(query,params,fetch=True)
                if sections == []:
                    return jsonify({'statusCode':404,'status':'Sections data does not exist'})
                if sections:
                    for i in sections[0][0]:
                        if id[0][1] == "Issue":
                            issue_list = "Yes"
                            mini = """SELECT q_id FROM question_bank WHERE section = %s AND issues_list = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                            params = (i,issue_list,True,road_type_id,stage_id,)
                            ids= execute_query(mini,params,fetch=True)
                            # if ids == []:
                            #     return jsonify({'statusCode':404,'status':'q_id data does not exist'})
                            for a in ids:
                                qid.append(a[0])
                            query2 = """SELECT q_id,questions,field_type,issues_list,hide_option FROM question_bank WHERE section = %s AND issues_list = %s AND hide_option is not %s AND road_type_id = %s AND stage_id = %s"""
                            params = (i,issue_list,True,road_type_id,stage_id,)
                            data = execute_query(query2,params,fetch=True)
                            # if data == []:
                            #     return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                            for j in data:
                                q_wise = {
                                            "question":j[1],
                                            "field_type":j[2],
                                            "issues_list":j[3],
                                            "hide_option":j[4]
                                            }
                                dict[j[0]] = q_wise
                                q_wise = {}
                            dict_params.append(dict)
                            dict = {}
                            result_dict[i] = dict_params
                            dict_params=[]
                        else:
                            mini = """SELECT q_id FROM question_bank WHERE section = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                            params = (i,True,road_type_id,stage_id,)
                            ids= execute_query(mini,params,fetch=True)
                            # if ids == []:
                            #     return jsonify({'statusCode':404,'status':'q_id data does not exist'})
                            for a in ids:
                                qid.append(a[0])
                            query2 = """SELECT q_id,questions,field_type,issues_list,hide_option FROM question_bank WHERE section = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                            params = (i,True,road_type_id,stage_id)
                            data = execute_query(query2,params,fetch=True)
                            # if data == []:
                            #     return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                            for j in data:
                                q_wise = {
                                            "question":j[1],
                                            "field_type":j[2],
                                            "issues_list":j[3],
                                            "hide_option":j[4]
                                            }
                                dict[j[0]] = q_wise
                                q_wise = {}
                            dict_params.append(dict)
                            dict = {}
                            result_dict[i] = dict_params
                            dict_params=[]
        else:
            mini = """SELECT audit_type_id,audit_method FROM audit_type WHERE audit_type_id = %s"""
            params = (audit_type_id,)
            id = execute_query(mini,params,fetch=True)
            if id == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
            query = """SELECT sections FROM audit_type WHERE audit_type_id = %s"""
            params = (audit_type_id,)
            sections = execute_query(query,params,fetch=True)
            if sections == []:
                return jsonify({'statusCode':404,'status':'sections data does not exist'})
            if sections:
                for i in sections[0][0]:
                    if id[0][1] == "Issue":
                        issue_list = "Yes"
                        mini = """SELECT q_id FROM question_bank WHERE section = %s AND issues_list = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                        params = (i,issue_list,True,road_type_id,stage_id,)
                        ids = execute_query(mini,params,fetch=True)
                        # if ids == []:
                        #     return jsonify({'statusCode':404,'status':'q_id data does not exist'})
                        for a in ids:
                            qid.append(a[0])
                        query2 = """SELECT q_id,questions,field_type,issues_list,hide_option FROM question_bank WHERE section = %s AND issues_list = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                        params = (i,issue_list,True,road_type_id,stage_id,)
                        data = execute_query(query2,params,fetch=True)
                        # if data == []:
                        #     return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                        for j in data:
                            q_wise = {
                                        "question":j[1],
                                        "field_type":j[2],
                                        "issues_list":j[3],
                                        "hide_option":j[4]
                                        }
                            dict[j[0]] = q_wise
                            q_wise = {}
                        dict_params.append(dict)
                        dict = {}
                        result_dict[i] = dict_params
                        dict_params=[]
                    else:
                        mini = """SELECT q_id FROM question_bank WHERE section = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                        params = (i,True,road_type_id,stage_id,)
                        ids= execute_query(mini,params,fetch=True)
                        # if ids == []:
                        #     return jsonify({'statusCode':404,'status':'q_id data does not exist'})
                        for a in ids:
                            qid.append(a[0])
                        query2 = """SELECT q_id,questions,field_type,issues_list,hide_option FROM question_bank WHERE section = %s AND hide_option is not %s  AND road_type_id = %s AND stage_id = %s"""
                        params = (i,True,road_type_id,stage_id)
                        data = execute_query(query2,params,fetch=True)
                        # if data == []:
                        #     return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                        for j in data:
                            q_wise = {
                                        "question":j[1],
                                        "field_type":j[2],
                                        "issues_list":j[3],
                                        "hide_option":j[4]
                                        }
                            dict[j[0]] = q_wise
                            q_wise = {}
                        dict_params.append(dict)
                        dict = {}
                        result_dict[i] = dict_params
                        dict_params=[]
        return jsonify({'statusCode':200,'status':'Success','details':result_dict,"q_id":qid})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})   
    
@app.route('/section_auditwise',methods=['GET','POST'])
def section_auditwise():
    try:
        audit_id = request.json.get('audit_id')
        dict = {}
        if audit_id == "" or audit_id is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        q_check = """SELECT auditor_stretch,auditor FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(q_check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT DISTINCT(question_bank.section),question_bank.section_id FROM answer_auditwise
        INNER JOIN question_bank ON answer_auditwise.section_id = question_bank.section_id WHERE audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'Data does not exist'})
        for i in data:
            dict[i[1]] = i[0]
        return jsonify({'statusCode':200,'status':'Success','details':dict})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
@app.route('/storing_questions',methods = ['GET','POST'])
def storing_questions():
    try:
        template = request.json.get('template')
        audit_type_id = request.json.get('audit_type_id')
        sections = request.json.get('sections')
        questions = request.json.get('questions')
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        all_sections = []
        dummy = []
        extra = []
        qualify = []
        sec_list = []
        check_list = []
        if template == "" or template is None or road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or audit_type_id is None or sections is None or questions is None or audit_type_id == "" or sections == "" or questions == "" or sections == []:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        else:
            if type(questions) != dict:
                return jsonify({'statusCode':400,'status':'Invalid type for questions'})
            sec_count = len(sections)
            for category, q_list in questions.items():
                for q_id, field_type in q_list.items():
                    have = q_id.split('.')
                    check_list.append(q_id)
                    if have[-1] == "2":
                        if field_type != "Mandatory":
                            get_sec = """SELECT section FROM question_bank WHERE q_id = %s"""
                            params = (q_id,)
                            sec_name = execute_query(get_sec,params,fetch=True)
                            status = f"Chainage question should be 'Mandatory' in {sec_name[0][0]} section, but it's '{field_type}'"
                            return jsonify({'statusCode': 400, 'status': 'Chainages are mandatory for all sections', 'message': status})
            for i in check_list:
                ids = i.split('.')
                if ids[-1] == "2":
                    sec_list.append(ids[2])
                    qualify.append(i)
            if qualify == [] or len(qualify) != sec_count:
                return jsonify({'statusCode':400,'status':'Chainage question should be included in all sections'})
            if template == 'True' or template == True:                
                check = """SELECT sections FROM template WHERE template_id = %s"""
                params = (audit_type_id,)
                verify = execute_query(check,params,fetch=True)
                if verify == []:
                    return jsonify({'statusCode':404,'status':'Sections data does not exist'})
                else:
                    # if len(verify[0][0]) != len(sections):
                    #     return jsonify({'statusCode':400,'status':'Extra section entered in sections'})
                    for i in sections:
                        mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s AND stage_id = %s AND road_type_id = %s"""
                        params = (i,stage_id,road_type_id,)
                        data = execute_query(mini,params,fetch=True)
                        if data[0][0] not in verify[0][0]:
                            status = 'Invalid section ({data}) entered in sections'.format(data=data[0][0])
                            return jsonify({'statusCode':400,'status':status})
                mini = """SELECT template_id FROM template WHERE template_id = %s"""
                params = (audit_type_id,)
                id = execute_query(mini,params,fetch=True)
                if id == []:
                    return jsonify({'statusCode':400,'status':'Invalid template_id(audit_type_id)'})
                section_fetch = """SELECT DISTINCT(section_id) FROM question_bank"""
                params = ()
                data3 = execute_query(section_fetch,params,fetch=True)
                for i in data3:
                    if i[0] is not None:
                        all_sections.append(i[0])
                if type(sections) == list:
                    for j in sections:
                        mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s  AND stage_id = %s AND road_type_id = %s"""
                        params = (j,stage_id,road_type_id,)
                        data = execute_query(mini,params,fetch=True)
                        if j not in all_sections:
                            return jsonify({'statusCode':400,'status':'Invalid section'})
                        else:
                            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s  AND stage_id = %s AND road_type_id = %s"""
                            params = (j,stage_id,road_type_id,)
                            data = execute_query(mini,params,fetch=True)
                            dummy.append(data[0][0])
                else:
                    return jsonify({'statusCode':400,'status':'Invalid input type'})
                if id == []:
                    return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
                else:
                    query = """UPDATE template SET sections = %s,questions = %s WHERE template_id = %s"""
                    params = (dummy,json.dumps(questions),audit_type_id,)
                    execute_query(query,params)
                return jsonify({'statusCode':200,'status':'Successfully updated template questions'})
            else:
                check = """SELECT sections FROM audit_type WHERE audit_type_id = %s"""
                params = (audit_type_id,)
                verify = execute_query(check,params,fetch=True)
                for i in verify[0][0]:
                    medquery = """SELECT DISTINCT(section_id) FROM question_bank WHERE section = %s  AND stage_id = %s AND road_type_id = %s"""
                    params = (i,stage_id,road_type_id)
                    sec_id = execute_query(medquery,params,fetch=True)
                    extra.append(sec_id[0][0])
                if verify == []:
                    return jsonify({'statusCode':404,'staus':'section_id data does not exist'})
                else:
                    # print(len(verify[0][0]),len(sections),'here')
                    # if len(verify[0][0]) != len(sections):
                    #     return jsonify({'statusCode':400,'status':'Extra section entered in sections'})
                    for i in sections:
                        if i in extra:
                            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s  AND stage_id = %s AND road_type_id = %s"""
                            params = (i,stage_id,road_type_id,)
                            data = execute_query(mini,params,fetch=True)
                            # if data[0][0] not in verify[0][0]:
                            #     print(i,data[0][0],'daqt-')
                            #     status = 'Invalid section ({data}) entered in sections'.format(data=data[0][0])
                            #     return jsonify({'statusCode':400,'status':status})
                for i in questions.keys():
                    # if i not in verify[0][0]:
                    #     print(i,'i',verify[0][0])
                    #     status = 'Invalid section ({data}) entered in questions'.format(data=i)
                    #     return jsonify({'statusCode':400,'status':status})
                    qids = questions[i]
                    q_keys = list(qids.keys())
                    for a in q_keys:
                        txt = a.split('.')
                        if txt[2] not in sections:
                            status = 'Invalid section ({data}) entered in questions'.format(data=a)
                            return jsonify({'statusCode':400,'status':status})  
                if len(questions.keys()) != len(sections):
                    return jsonify({'statusCode':400,'status':'Inaccurate number of sections entered in questions'})
                mini = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
                params = (audit_type_id,)
                id = execute_query(mini,params,fetch=True)
                if id == []:
                    return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
                section_fetch = """SELECT DISTINCT(section_id) FROM question_bank"""
                params = ()
                data3 = execute_query(section_fetch,params,fetch=True)
                for i in data3:
                    if i[0] is not None:
                        all_sections.append(i[0])
                if type(sections) == list:
                    for j in sections:
                        if j not in all_sections:
                            return jsonify({'statusCode':400,'status':'Invalid section'})
                        else:
                            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
                            params = (j,)
                            data = execute_query(mini,params,fetch=True)
                            dummy.append(data[0][0])
                else:
                    return jsonify({'statusCode':400,'status':'Invalid input type'})
                if id == []:
                    return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
                else:
                    query = """UPDATE audit_type SET sections = %s,questions = %s WHERE audit_type_id = %s"""
                    params = (dummy,json.dumps(questions),audit_type_id,)
                    execute_query(query,params)
                return jsonify({'statusCode':200,'status':'Successfully updated audit type questions'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to store data'+str(e)}) 
    
#audit plan

@app.route('/audit_plan',methods = ['GET','POST'])
def audit_plan():
    try:
        audit_type_id = request.form.get('audit_type_id')
        stretch_name = request.form.get('stretch_name')
        state = request.form.get('state')
        district = request.form.get('district')
        name_of_road = request.form.get('name_of_road')
        road_number = request.form.get('road_number')
        no_of_lanes = request.form.get('no_of_lanes')
        road_owning_agency = request.form.get('road_owning_agency')
        chainage_start = request.form.get('chainage_start')
        chainage_end = request.form.get('chainage_end')
        location_start = request.form.get('location_start')
        location_end = request.form.get('location_end')
        latitude_start = request.form.get('latitude_start')
        latitude_end = request.form.get('latitude_end')
        stretch_length = request.form.get('stretch_length')
        created_by = request.form.get('created_by')
        created_on = request.form.get('created_on')
        file_name = request.form.get('file_name')
        state_name = request.form.get('state_name')
        district_name = request.form.get('district_name')
        audit_type = request.form.get('audit_type')
        total = request.files
        file_save = []
        status = 'Audit Planned'
        format_data = "%d-%m-%Y"
        created_on = datetime.strptime(created_on,format_data)
        validation = ['audit_type_id','stretch_name','state','district','name_of_road','road_number','no_of_lanes','road_owning_agency','chainage_start',
                      'chainage_end','location_start','location_end','latitude_start','latitude_end','stretch_length','created_by','created_on',
                      'state_name','district_name','audit_type']
        check = validate(validation)
        if check != {}:
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statusCode":400,"status":status})
        if file_name is None or file_name == "":
            return jsonify({'statusCode':400,'status':'KML File is mandatory'})
        if '.' not in file_name:
                return jsonify({'statusCode':400,'status':'Please mention file type'})
        if file_name.split('.')[0] is None or file_name.split('.')[0] == "" or file_name.split('.')[1] == "" or file_name.split('.')[0] is None:
            return jsonify({'statusCode':400,'status':'Invalid file_name'})
        check = """SELECT user_id,role FROM users WHERE  user_id = %s"""
        params = (created_by,)
        data = execute_query(check,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id in created_by'})
        if data[0][1] != 'Lead Auditor' and data[0][1] != 'CoERS' and data[0][1] != 'Owner':
            return jsonify({'statusCode':400,'status':'Auditor cannot audit_plan'}) 
        mini = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id = execute_query(mini,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        mini2 = """SELECT stretch_name FROM audit_type WHERE stretch_name = %s AND audit_type_id = %s"""
        params = (stretch_name,audit_type_id,)
        stretch = execute_query(mini2,params,fetch=True)
        print('stretch',stretch)
        if stretch == []:
            return jsonify({'statusCode':400,'status':'Invalid stretch name','message':'Invalid stretch name'})
        mini = """SELECT audit_type FROM dropdown_values WHERE audit_type = %s"""
        params = (audit_type,)
        id = execute_query(mini,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type'})
        if file_name is not None:
            file_type = file_name.split('.')[1]
            rsa_kml_file = 'Audit plan'
            parent_dir = rsa_kml_file + "/" + str(stretch_name)
            bool1 = os.path.exists(parent_dir)
            if bool1 is False:
                os.makedirs(parent_dir)
            upload_path = os.path.join(parent_dir,str(stretch_name))
            file = total.get(file_name) 
            path = upload_path+"."+file_type
            file.save(path)
            file_save.append(path)
        connection_string = f"postgresql://{'postgres'}:{'postgres'}@{'localhost'}:{'5432'}/{'rsa'}"
        engine = create_engine(connection_string)
        kml_file_path = path
        gdf = gpd.read_file(kml_file_path, driver='KML')
        print(gdf,'geofile')
        gdf["audit_type_id"] = audit_type_id
        gdf["stretch_name"] = stretch_name
        gdf.to_postgis('geojson_total_stretch', engine, if_exists='append', index=False)
        delete_status = 'False'
        audit_plan_id = ''.join(random.choices('ABCDEFGHI0123456789abcdefghi',k=5))
        query = """INSERT INTO audit_plan (audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,
        location_start,location_end,latitude_start,latitude_end,stretch_length,updated_by,created_on,delete_status,audit_plan_id,file_save,status,state_name,district_name,audit_type)
          VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        params = (audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,
                  latitude_start,latitude_end,stretch_length,created_by,created_on,delete_status,audit_plan_id,file_save,status,state_name,district_name,audit_type,)
        execute_query(query,params)
        mini_update = """UPDATE audit_type SET status = %s WHERE audit_type_id = %s"""
        params = (status,audit_type_id,)
        execute_query(mini_update,params)
        json_response = {'audit_plan_id':audit_plan_id}
        return jsonify({'statusCode':200,'status':'audit_planned successfully'})
    except Exception as e:   
        return jsonify({'statusCode':500,'status':'Failed to store data'+str(e)})
    
@app.route('/audit_plan_list',methods = ['GET','POST'])
def audit_plan_list():
    try:
        dict = {}
        dict_params = []
        query = """SELECT audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,created_on,updated_by,audit_plan_id,audit_type FROM audit_plan"""
        params = ()
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'Audit data does not exist'})
        for i in data:
            dict = { "audit_type_id":i[0],
                        "stretch_name":i[1],
                        "state":i[2],
                        "district":i[3],
                        "name_of_road":i[4],
                        "road_number":i[5],
                        "no_of_lanes":i[6],
                        "road_owning_agency":i[7],
                        "chainage_start":i[8],
                        "chainage_end":i[9],
                        "location_start":i[10],
                        "location_end":i[11],
                        "latitude_start":i[12],
                        "latitude_end":i[13],
                        "stretch_length":i[14],
                        "created_on":i[15],
                        "updated_by":i[16],
                        "audit_plan_id":i[17],
                        "audit_type":i[18]
                    }
            dict_params.append(dict)
        dict = {}
        return jsonify({'statusCode':200,'status':'Success',"details":dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'}) 

#audit assignment
@app.route('/audit_assignment',methods = ['GET','POST'])
def audit_assignment():
    try:
        audit_type_id = request.json.get('audit_type_id')
        stretch_name = request.json.get('stretch_name')
        audit_plan_id = request.json.get('audit_plan_id')
        add_auditors = request.json.get('add_auditors')
        type_of_audit = request.json.get('type_of_audit')
        start_by_date = request.json.get('start_by_date')
        submit_by_date = request.json.get('submit_by_date')
        created_by = request.json.get('created_by')
        auditor_stretch = request.json.get('auditor_stretch')
        created_on = request.json.get('created_on')
        ae_userid = request.json.get('ae_userid')
        field_user = request.json.get('field_user')
        format_data = "%d-%m-%Y"
        start_by_date = datetime.strptime(start_by_date, format_data)
        submit_by_date = datetime.strptime(submit_by_date, format_data)
        created_on = datetime.strptime(created_on, format_data)
        type_of_audits = []
        dummy = []
        datecheck = []
        the_status = 'Audit Assigned'
        audit_type = ['Travel Direction','Chainage']
        if ae_userid is None or ae_userid == "" or type_of_audit is None or type_of_audit == "" or submit_by_date == "" or submit_by_date is None or created_by is None or created_by == "" or auditor_stretch == "" or auditor_stretch is None or start_by_date == "" or start_by_date is None or stretch_name is None or stretch_name == "" or audit_plan_id == "" or audit_plan_id is None or add_auditors is None or add_auditors == "" or audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        if type_of_audit not in audit_type:
            return jsonify({'statusCode':400,'status':'Invalid type_of_audit'})
        audit = 'Audit'
        status = "Assigned"
        query0 = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id = execute_query(query0,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query2 = """SELECT audit_plan_id FROM audit_plan WHERE audit_plan_id = %s"""
        params = (audit_plan_id,)
        data1 = execute_query(query2,params,fetch=True)
        if data1 == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_plan_id'})
        query3 = """SELECT stretch_name FROM audit_plan WHERE audit_plan_id = %s"""
        params = (audit_plan_id,)
        data2 = execute_query(query3,params,fetch=True)
        if stretch_name != data2[0][0]: 
            return jsonify({'statusCode':400,'status':'Invalid stretch_name'})
        query4 = """SELECT type_of_audit FROM dropdown_values"""
        params = ()
        data3 = execute_query(query4,params,fetch=True)
        if data3 == []:
            return jsonify({'statusCode':404,'status':'type_of_audit data does not exist'})
        for i in data3:
            if i[0] is not None:
                type_of_audits.append(i[0])
        if type_of_audit not in type_of_audits:
            return jsonify({'statusCode':400,'status':'Invalid type_of_audit'})
        check = """SELECT user_id,role FROM users WHERE  user_id = %s"""
        params = (created_by,)
        data = execute_query(check,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id in created_by'})
        if data[0][1] != 'Lead Auditor' and data[0][1] != 'CoERS' and data[0][1] != 'Owner':
            return jsonify({'statusCode':400,'status':'Auditor cannot create audit_assignment'}) 
        if type(add_auditors) == list:
            for i in add_auditors:
                if i == "":
                    return jsonify({'statusCode':400,'status':'Incomplete data in add_auditors'})
                query5 = """SELECT user_id,role FROM users WHERE user_id = %s"""
                params = (i,)
                auditor_id = execute_query(query5,params,fetch=True)
                if auditor_id == []:
                    status = "{auditor_id} auditor_id does not exist".format(auditor_id=i)
                    return jsonify({'statusCode':400,"status":status})
                if auditor_id[0][1] != 'Auditor':
                    status = "{auditor_id} auditor_id is not an auditor".format(auditor_id=i)
                    return jsonify({'statusCode':400,"status":status})
        else:
            return jsonify({'statusCode':400,'status':"Invalid input type for add_auditors"})
        ae_chck = """SELECT user_id FROM users WHERE user_id = %s AND role = %s"""
        params = (ae_userid,"AE",)
        ae_ver = execute_query(ae_chck,params,fetch=True)
        if ae_ver == []:
            return jsonify({'statusCode':400,'status':'Invalid ae_userid'})
        if field_user is not None and field_user != "":
            fu_chck = """SELECT user_id,role,email FROM users WHERE  user_id = %s"""
            params = (field_user,)
            fu_verfy = execute_query(fu_chck,params,fetch=True)
            if fu_verfy == []:
                return jsonify({'statusCode':400,'status':'Invalid field_user'})
        if len(id)!= 0:
            if len(data1) != 0:
                the_keys = list(auditor_stretch.keys())
                for i in the_keys:
                    if i not in add_auditors:
                        return jsonify({'statusCode':400,'status':'Invalid user_id in auditor_stretch'})
                if type(auditor_stretch) != dict:
                    return jsonify({'statusCode':400,'status':"Invalid input type for auditor_stretch"})
                assigned_keys = list(auditor_stretch.values())
                keys = list(auditor_stretch.keys())
                dummy_dict = {}
                auditor = ""
                a = 0
                for i in assigned_keys:
                    if type_of_audit == 'Chainage':
                        if 'start_point' not in i or 'end_point' not in i or 'stretch_length' not in i:
                            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details in auditor_stretch'})
                    elif type_of_audit == 'Travel Direction':
                        if 'travel_direction' not in i or 'stretch_length' not in i:
                            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details in auditor_stretch'})
                for i in assigned_keys:
                    dummy_dict[keys[a]] = i 
                    auditor = keys[a]
                    id = ''.join(random.choices('0123456789',k=3))
                    audit_id = f"{audit_type_id}{id}"
                    stretch_length = (i)['stretch_length']
                    query = """INSERT INTO audit_assignment (audit_type_id,stretch_name,audit_plan_id,auditor,type_of_audit,start_date,submit_date,created_by,status,audit_id,auditor_stretch,stretch_length,created_on,ae_userid,field_user) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                    params = (audit_type_id,stretch_name,audit_plan_id,auditor,type_of_audit,start_by_date,submit_by_date,created_by,the_status,audit_id,json.dumps(dummy_dict),stretch_length,created_on,ae_userid,field_user)
                    execute_query(query,params)
                    query_get=  """SELECT email FROM users WHERE user_id = %s"""
                    params = (auditor,)
                    auditor_email = execute_query(query_get,params,fetch=True)[0][0]
                    audit_assigned_mail(auditor,auditor_email,stretch_name,audit_id,start_by_date,submit_by_date)
                    if field_user is not None and field_user != "":
                        audit_assigned_mail(fu_verfy[0][0],fu_verfy[0][2],stretch_name,audit_id,start_by_date,submit_by_date)
                    dummy_dict = {}
                    a += 1
                    dummy.append(audit_id)
                type_upd = """UPDATE audit_type SET status = %s WHERE audit_type_id = %s"""
                params = (the_status,audit_type_id,)
                execute_query(type_upd,params)
                plan_upd = """UPDATE audit_plan SET status = %s WHERE audit_plan_id = %s"""
                params = (the_status,audit_plan_id,)
                execute_query(plan_upd,params)
                json_response = {"audit_id":dummy}
                return jsonify({'statusCode':200,'status':'audit assigned successfully','details':json_response})
            else:
                return jsonify({'statusCode':400,'status':'Audit plan id does not exist'})
        else:
            return jsonify({'statusCode':400,'status':'Audit type does not exist'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to store data'+str(e)})

@app.route('/question_bank',methods = ['GET','POST'])
def question_bank():
    try:
        stage_id = request.json.get('stage_id')
        road_type_id = request.json.get('road_type_id')
        field_type = request.json.get('field_type')
        dict = {}
        dict_params = []
        result_dict = {}
        q_wise = {}
        qid = []
        if stage_id is not None or stage_id != "":
            stage_query = """SELECT stage_dd FROM dropdown_values WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            if stage == []:
                return jsonify({'statusCode':400,'status':'Invalid stage'})
        if road_type_id is not None or road_type_id != "":
            query0 = """SELECT road_type_dd FROM dropdown_values WHERE road_type_id = %s"""
            params = (road_type_id,)
            road_type = execute_query(query0,params,fetch=True)
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
        if stage_id is None or road_type_id is None:
            return jsonify({'statusCode':400,'status':'Incomplete details fill all the data'})
        if road_type_id != "" and stage_id != "":
            st_check = """SELECT stage_id FROM dropdown_values WHERE stage_id = %s"""
            params = (stage_id,)
            chkdata = execute_query(st_check,params,fetch=True)
            if chkdata == []:
                return jsonify({'statusCode':400,'status':'Invalid stage_id'})
            rd_check = """SELECT road_type_id FROM dropdown_values WHERE road_type_id = %s"""
            params = (road_type_id,)
            chkrddata = execute_query(rd_check,params,fetch=True)
            if chkrddata == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
            if field_type != "":
                mini = """SELECT field_type FROM dropdown_values WHERE field_type = %s"""
                params=  (field_type,)
                field_type_fetch = execute_query(mini,params,fetch=True)
                if field_type_fetch == []:
                    return jsonify({'statusCode':400,'status':'Invalid field_type'})
                mini = """SELECT q_id,questions FROM question_bank WHERE road_type_id = %s AND stage_id = %s AND field_type = %s"""
                params = (road_type_id,stage_id,field_type,)
            else:
                mini = """SELECT q_id,questions FROM question_bank WHERE road_type_id = %s AND stage_id = %s"""
                params = (road_type_id,stage_id,)
            id = execute_query(mini,params,fetch=True)
            if id == []:
                return jsonify({'statusCode':400,'status':'Data in this combination does not exist'})
            for i in id:
                qid.append(i[0])
            query = """SELECT DISTINCT(section) FROM question_bank WHERE stage_id = %s AND road_type_id = %s"""
            params = (stage_id,road_type_id,)
            sections = execute_query(query,params,fetch=True)
            if sections == []:
                return jsonify({'statusCode':404,'status':'section data does not exist'})
            if sections:
                for i in sections:
                    if field_type:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE stage_id = %s AND road_type_id = %s AND field_type = %s AND section = %s"""
                        params = (stage_id,road_type_id,field_type,i[0],)
                    else:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE stage_id = %s AND road_type_id = %s AND section = %s"""
                        params = (stage_id,road_type_id,i[0],)
                    data = execute_query(query2,params,fetch=True)
                    if data == []:
                        return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                    for j in data:
                        if j[3] == "Master Table" or j[3] == 'Master_Table':
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":True,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "audit_method":j[6]
                                    }
                        else:
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":False,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        dict[j[0]] = q_wise
                        q_wise = {}
                    dict_params.append(dict)
                    dict = {}
                    result_dict[i[0]] = dict_params
                    dict_params=[]
            else:
                return jsonify({'statusCode':400,'status':'Invalid stage_id'})
            return jsonify({'statusCode':200,'status':'Success','details':result_dict,"q_id":qid})
        if stage_id != "":
            stage_query = """SELECT stage_dd FROM dropdown_values WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            if stage == []:
                return jsonify({'statusCode':400,'status':'Invalid stage_id'})
            if field_type != "":
                mini = """SELECT q_id,questions FROM question_bank WHERE stage_id = %s AND field_type = %s"""
                params = (stage_id,field_type,)
            else:
                mini = """SELECT q_id,questions FROM question_bank WHERE stage_id = %s"""
                params = (stage_id,)
            id = execute_query(mini,params,fetch=True)
            if id == []:
                return jsonify({'statusCode':400,'status':'question_bank data does not exist'})
            for i in id:
                qid.append(i[0])
            query = """SELECT section FROM question_bank WHERE stage_id = %s"""
            params = (stage_id,)
            sections = execute_query(query,params,fetch=True)
            if sections == []:
                return jsonify({'statusCode':404,'status':'section data does not exist'})
            if sections:    
                for i in sections:
                    if field_type:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE stage_id = %s AND field_type = %s AND section = %s"""
                        params = (stage_id,field_type,i[0],)
                    else:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE stage_id = %s AND section = %s"""
                        params = (stage_id,i[0],)
                    data = execute_query(query2,params,fetch=True)
                    if data == []:
                        return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                    for j in data:
                        if j[3] == "Master Table" or j[3] == 'Master_Table':
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":True,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        else:
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":False,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        dict[j[0]] = q_wise
                        q_wise = {}
                    dict_params.append(dict)
                    dict = {}
                    result_dict[i[0]] = dict_params
                    dict_params=[]
            return jsonify({'statusCode':200,'status':'Success','details':result_dict,"q_id":qid})
        if road_type_id != "":
            query0 = """SELECT road_type_dd FROM dropdown_values WHERE road_type_id = %s"""
            params = (road_type_id,)
            road_type = execute_query(query0,params,fetch=True)
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
            if field_type != "":
                mini = """SELECT q_id,questions FROM question_bank WHERE road_type_id = %s AND field_type = %s"""
                params = (road_type_id,field_type,)
            else:
                mini = """SELECT q_id,questions FROM question_bank WHERE road_type_id = %s"""
                params = (road_type_id,)
            id = execute_query(mini,params,fetch=True)
            if id == []:
                return jsonify({'statusCode':400,'status':'question_bank data does not exist'})
            for i in id:
                qid.append(i[0])
            query = """SELECT section FROM question_bank WHERE road_type_id = %s"""
            params = (road_type_id,)
            sections = execute_query(query,params,fetch=True)
            if sections == []:
                return jsonify({'statusCode':404,'status':'section data does not exist'})
            if sections:
                for i in sections:
                    if field_type:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE road_type_id = %s AND field_type = %s AND section = %s"""
                        params = (road_type_id,field_type,i[0],)
                    else:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE road_type_id = %s AND section = %s"""
                        params = (road_type_id,i[0],)
                    data = execute_query(query2,params,fetch=True)
                    if data == []:
                        return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                    for j in data:
                        if j[3] == "Master Table" or j[3] == 'Master_Table':
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":True,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        else:
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":False,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        dict[j[0]] = q_wise
                        q_wise = {}
                    dict_params.append(dict)
                    dict = {}
                    result_dict[i[0]] = dict_params
                    dict_params=[]
            return jsonify({'statusCode':200,'status':'Success','details':result_dict,"q_id":qid})
        else:
            if field_type != "":
                mini = """SELECT q_id,questions FROM question_bank WHERE field_type = %s"""
                params = (field_type,)
            else:
                mini = """SELECT q_id,questions FROM question_bank"""
                params = ()
            id = execute_query(mini,params,fetch=True)
            if id == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
            for i in id:
                qid.append(i[0])
            query = """SELECT DISTINCT(section) FROM question_bank"""
            params = ()
            sections = execute_query(query,params,fetch=True)
            if sections == []:
                return jsonify({'statusCode':404,'status':'section data does not exist'})
            if sections:
                for i in sections:
                    if field_type:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE section = %s AND field_type = %s"""
                        params = (i[0],field_type,)
                    else:
                        query2 = """SELECT q_id,questions,field_type,master_table,irc_help_tool,hide_option,issues_list FROM question_bank WHERE section = %s"""
                        params = (i[0],)
                    data = execute_query(query2,params,fetch=True)
                    if data == []:
                        return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
                    for j in data:
                        if j[3] == "Master Table" or j[3] == 'Master_Table':
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],
                                    "field_type":j[2],
                                    "master_table":True,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        else:
                            q_wise = {
                                    "q_id":j[0],
                                    "question":j[1],    
                                    "field_type":j[2],
                                    "master_table":False,
                                    "irc_help_tool":j[3],
                                    "hide_option":j[5],
                                    "issues_list":j[6]
                                    }
                        dict[j[0]] = q_wise
                        q_wise = {}
                    dict_params.append(dict)
                    dict = {}
                    result_dict[i[0]] = dict_params
                    dict_params=[]
            return jsonify({'statusCode':200,'status':'Success','details':result_dict,"q_id":qid})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})


@app.route('/edit_fieldtype',methods=['GET','POST'])
def edit_fieldtype():
    try:
        q_id = request.json.get('q_id')
        action = request.json.get('action')
        if q_id is None or q_id == "" or action == "" or action is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        if type(q_id) != list:
            return jsonify({'statusCode':404,'status':'Invalid input type for q_id'})
        if action != 'field_type' and action != 'visibility':
            return jsonify({'statusCode':404,'status':'Invalid action'})
        if action == 'field_type':
            for i in q_id:
                query = """SELECT field_type FROM question_bank WHERE q_id = %s"""
                params = (i,)
                data = execute_query(query,params,fetch=True)
                if data == []:
                    return jsonify({'statusCode':400,'status':'Invalid q_id'})
                if data[0][0] == 'Mandatory':
                    field_type = 'Optional'
                    query2  ="""UPDATE question_bank SET field_type = %s WHERE q_id = %s"""
                    params = (field_type,i,)
                    execute_query(query2,params)
                elif data[0][0] == 'Optional':
                    field_type = 'Mandatory'
                    query2  ="""UPDATE question_bank SET field_type = %s WHERE q_id = %s"""
                    params = (field_type,i,)
                    execute_query(query2,params)
            return jsonify({'statusCode':200,'status':'Successfully edited field_type'})
        elif action == 'visibility':
            for i in q_id:
                query = """SELECT hide_option FROM question_bank WHERE q_id = %s"""
                params = (i,)   
                data = execute_query(query,params,fetch=True)
                if data == []:
                    return jsonify({'statusCode':400,'status':'Invalid q_id'})
                if data[0][0] == '' or data[0][0] is None:
                    show = 'True'
                    query2  ="""UPDATE question_bank SET hide_option = %s WHERE q_id = %s"""
                    params = (show,i,)
                    execute_query(query2,params)
                elif data[0][0] == True:
                    show = 'False'
                    query2  ="""UPDATE question_bank SET hide_option = %s WHERE q_id = %s"""
                    params = (show,i,)
                    execute_query(query2,params)
                elif data[0][0] == False:
                    show = 'True'
                    query2  ="""UPDATE question_bank SET hide_option = %s WHERE q_id = %s"""
                    params = (show,i,)
                    execute_query(query2,params)
                else:
                    return jsonify({'statusCode':200,'status':'Successfully edited visibility'}) 
            return jsonify({'statusCode':200,'status':'Successfully edited field_type'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'})    

@app.route('/master_table_view',methods = ['GET','POST'])
def master_table_view():
    try:    
        section_id = request.json.get('section_id')
        q_id = request.json.get('q_id')
        dict = {}
        dict_params = []
        qid = []
        q_wise = {}
        road_types = {}
        stage_types = {}
        rt = []
        st = []
        dummy = []
        section_types = {}
        sect = []
        query = """SELECT DISTINCT(road_type_id),road_type FROM question_bank"""
        params = ()
        data = execute_query(query,params,fetch=True)
        for i in data:
            if i[0] is not None:
                road_types[i[0]] = i[1]
                rt.append(i[0])
        query2 = """SELECT DISTINCT(stage_id),stage FROM question_bank"""
        params = ()
        data1 = execute_query(query2,params,fetch=True)
        if data1 == []:
            return jsonify({'statusCode':404,'status':'stage data does not exist'})
        for i in data1:
                stage_types[i[0]] = i[1]
                st.append(i[0])
        query3 = """SELECT DISTINCT(section_id),stage FROM question_bank"""
        params = ()
        data2 = execute_query(query3,params,fetch=True)
        if data2 == []:
            return jsonify({'statusCode':404,'status':'section_id data does not exist'})
        for i in data2:
                section_types[i[0]] = i[1]
                sect.append(i[0])
        if q_id == "" or q_id is None or section_id == "" or section_id is None:
            return jsonify({'statusCode':400,'status':'Incomplete data Please fill all the details'}) 
        txt = q_id.split('.')
        if len(txt) < 4:
            return jsonify({'statusCode':400,'status':'Invalid q_id'})
        query = """SELECT q_sub_id,master_table,show_option,dependency_dd,irc_help_tool,img_path FROM master_table WHERE section_id = %s AND q_id = %s"""
        params = (section_id,q_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
                return jsonify({'statusCode':404,'status':"q_sub_id does not exist"})
        else:
            for i in data:
                if i[5] is not None:
                    path = i[5]
                    final_path = path[0].split('/')
                else:
                    path = None
                    final_path = path
                qid.append(i[0])
                q_wise = {
                    "sub_q_id":i[0],
                    "answer":i[1],
                    "show_option":i[2],
                    "dependency_dd":i[3],
                    "irc_help_tool":i[4],
                    "irc_path":final_path
                }
                dummy.append(q_wise)
                # dict[i[0]] = q_wise
                q_wise = {}
            return jsonify({'statusCode':200,'status':'Success','details':dummy,"q_id":qid,"road_type":road_types,"stage_type":stage_types,"road_type_id":rt,"stage_type_id":st,"section_type":section_types,"section_type_id":sect})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/question_view',methods = ['GET','POST'])
def question_view():
    try:    
        section_id = request.json.get('section_id')
        q_id = request.json.get('q_id')
        dict = {}
        dict_params = []
        qid = []
        q_wise = {}
        road_types = {}
        stage_types = {}
        rt = []
        st = []
        dummy = []
        section_types = {}
        sect = []
        query = """SELECT DISTINCT(road_type_id),road_type FROM question_bank"""
        params = ()
        data = execute_query(query,params,fetch=True)
        for i in data:
            if i[0] is not None:
                road_types[i[0]] = i[1]
                rt.append(i[0])
        query2 = """SELECT DISTINCT(stage_id),stage FROM question_bank"""
        params = ()
        data1 = execute_query(query2,params,fetch=True)
        if data1 == []:
            return jsonify({'statusCode':404,'status':'stage_id data does not exist'})
        for i in data1:
                stage_types[i[0]] = i[1]
                st.append(i[0])
        query3 = """SELECT DISTINCT(section_id),stage FROM question_bank"""
        params = ()
        data2 = execute_query(query3,params,fetch=True)
        if data2 == []:
            return jsonify({'statusCode':404,'status':'stage_id data does not exist'})
        for i in data2:
                section_types[i[0]] = i[1]
                sect.append(i[0])
        if q_id == "" or q_id is None or section_id == "" or section_id is None:
            return jsonify({'statusCode':400,'status':'Incomplete data Please fill all the details'}) 
        txt = q_id.split('.')
        if len(txt) < 4:
            return jsonify({'statusCode':400,'status':'Invalid q_id'})
        query = """SELECT q_id,questions,field_type,conditions,master_table,functionality,data_type,irc_help_tool,issues_list FROM question_bank WHERE section_id = %s AND q_id = %s"""
        params = (section_id,q_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
                return jsonify({'statusCode':404,'status':"q_sub_id does not exist"})
        else:
            for i in data:
                q_wise = {
                    "q_id":i[0],
                    "question":i[1],
                    "field_type":i[2],
                    "conditions":i[3],
                    "master_table":i[4],
                    "functionality":i[5],
                    "data_type":i[6],
                    "irc_help_tool":i[7],
                    "issues_list":i[8]
                }
                dummy.append(q_wise)
                q_wise = {}
            return jsonify({'statusCode':200,'status':'Success','details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/master_table_edit',methods=['GET','POST'])
def master_table_edit():
    try:
        q_sub_ids = request.json.get('q_sub_ids')
        delete_status = ""
        if q_sub_ids is None or q_sub_ids == "" or q_sub_ids == []:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        if type(q_sub_ids) != list:
            return jsonify({'statusCode':400,'status':'Invalid input type for q_sub_ids'})
        for i in q_sub_ids:
            chck = """SELECT q_sub_id FROM master_table WHERE q_sub_id = %s"""
            params = (i,)
            data = execute_query(chck,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid q_sub_ids'})
        for i in q_sub_ids:
            query = """SELECT q_sub_id,show_option FROM master_table WHERE q_sub_id = %s"""
            params = (i,)
            data1 = execute_query(query,params,fetch=True)
            if data1[0][1] == True:
                delete_status = False
            else:
                delete_status = True
            query1 = """UPDATE master_table SET show_option = %s WHERE q_sub_id = %s"""
            params = (delete_status,i,)
            execute_query(query1,params)
        return jsonify({'statusCode':200,'status':'Successfully edited master_table'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})        

@app.route('/master_table_add',methods = ['GET','POST'])
def master_table_add():
    try:
        q_id = request.form.get('q_id')
        road_type_id = request.form.get('road_type_id')
        stage_id = request.form.get('stage_id')
        section_id = request.form.get('section_id')
        sub_questions = request.form.get('sub_questions')
        total = request.files
        dummy = []
        dummy_suffix = []
        all_sections = []
        file_saves = []
        num = 1
        choice = "choices"
        last_num = []
        if q_id == "" or q_id is None or section_id == "" or section_id is None or stage_id == "" or stage_id is None or road_type_id == "" or road_type_id is None:
            return jsonify({'statusCode':400,'status':'Please fill all the details'}) 
        else:   
            check = """SELECT q_id FROM question_bank WHERE q_id = %s"""
            params = (q_id,)
            verify = execute_query(check,params,fetch=True)
            if verify == []:
                return jsonify({'statusCode':400,'status':'Invalid q_id'})
            section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            data3 = execute_query(section_fetch,params,fetch=True)
            stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
            params = (road_type_id,)
            road_type = execute_query(query0,params,fetch=True)
            if data3 == []:
                return jsonify({'statusCode':400,'status':'Invalid section'})
            if stage == []:
                return jsonify({'statusCode':400,'status':'Invalid stage'})
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type'})
            sub_questions = json.loads(sub_questions)
            sub_q_list = list(sub_questions.values())
            txt = q_id.split('.')
            if txt[2] != section_id:
                return jsonify({'statusCode':400,'status':'q_id is not from the mentioned section_id'})
            for i in sub_q_list:
                values = list(i.values())
                query = """SELECT q_sub_id FROM master_table WHERE q_id = %s"""
                params = (q_id,)
                q_sub = execute_query(query,params,fetch=True)
                for a in q_sub:
                    sub_text = a[-1].split('.')
                    dummy.append(sub_text[2])
                    dummy_suffix.append(sub_text[1])
                    last_num.append(int(sub_text[-1]))
                last_num.sort()
                for j in values:
                    sub_keys = list(j.keys())
                    dummy.sort()
                    num_key = sub_text[3]
                    q_sub_id = road_type_id + "." + stage_id + "." + section_id + "." + str(num_key) + "." + str(int(last_num[-1]) + num)
                    num += 1
                    if "master_table" in sub_keys and "dependency_dd" in sub_keys and "show_option" in sub_keys:   
                        option = j["master_table"]
                        dependency_dd = j["dependency_dd"] 
                        show_option = j["show_option"]
                        if "file_name" in sub_keys:
                            the_file = j['file_name']
                            org_path = parent_dir + "/" + choice
                            bool1 = os.path.exists(org_path)
                            if bool1 is False:
                                os.makedirs(org_path)
                            user_path = os.path.join(org_path,str(q_id))
                            bool2 = os.path.exists(user_path)
                            if bool2 is False:
                                os.makedirs(user_path)
                            file = total.get(the_file)
                            path = user_path+"/"+q_sub_id
                            # final_path = os.path.join(user_path,i["file_name"])
                            file.save(path)
                            file_saves.append(path)
                            mini_count = """SELECT MAX(s_no) FROM master_table"""
                            params = (mini_count,)
                            count = execute_query(mini_count,params,fetch=True)
                            org_count = count[0][0] + 1
                            mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option,img_path) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                            params = (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,option,org_count,show_option,file_saves,)
                            execute_query(mini,params)
                            if "irc_help_tool" in sub_keys:
                                irc_help_tool = j["irc_help_tool"]
                                mini2 = """UPDATE master_table SET irc_help_tool = %s WHERE q_sub_id = %s"""
                                params = (irc_help_tool,q_sub_id,)
                                execute_query(mini2,params)
                            file_saves = []   
                        else:
                            mini_count = """SELECT MAX(s_no) FROM master_table"""
                            params = (mini_count,)
                            count = execute_query(mini_count,params,fetch=True)
                            org_count = count[0][0] + 1
                            mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                            params = (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,option,org_count,show_option,)
                            execute_query(mini,params)
                            if "irc_help_tool" in sub_keys:
                                irc_help_tool = j["irc_help_tool"]
                                mini2 = """UPDATE master_table SET irc_help_tool = %s WHERE q_sub_id = %s"""
                                params = (irc_help_tool,q_sub_id,)
                                execute_query(mini2,params)
                            file_saves = []
                    else:
                        return jsonify({'statusCode':400,'status':'Incomplete data please fill choice'}) 
            return jsonify({'statusCode':200,'status':'Success'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
        

@app.route('/dependency',methods=['GET','POST'])
def dependency():
    try:
        q_id = request.json.get('q_id')
        sub_q_id = request.json.get('sub_q_id')
        dict =  {}
        dict_params = []
        if q_id is None or q_id == "" or sub_q_id == "" or sub_q_id is None:
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        q_check = """SELECT q_id FROM question_bank WHERE q_id = %s"""
        params = (q_id,)
        qid_ver = execute_query(q_check,params,fetch=True)
        subq_check = """SELECT q_sub_id FROM master_table WHERE q_sub_id = %s"""
        params = (sub_q_id,)
        subqid_ver = execute_query(subq_check,params,fetch=True)
        if qid_ver == []:
            return jsonify({'statusCode':400,'status':'Invalid q_id'})
        if subqid_ver == []:
            return jsonify({'statusCode':400,'status':'Invalid sub_q_id'})
        query = """SELECT master_table FROM master_table WHERE q_sub_id = %s"""
        params = (sub_q_id,)
        dependency_val = execute_query(query,params,fetch=True)
        query2 = """SELECT q_sub_id,master_table,dependency_dd,irc_help_tool,show_option FROM master_table WHERE dependency_dd = %s AND q_id = %s"""
        params = (dependency_val[0][0],q_id,) 
        master_table = execute_query(query2,params,fetch=True)
        for i in master_table:
            dict["sub_q_id"] = i[0]
            dict["answer"] = i[1]
            dict["dependency"] = i[2]
            dict["irc_help_tool"] = i[3]
            dict["show_option"] = i[4]
            dict_params.append(dict)
            dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})            
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

# @app.route('/section_creation',methods=['GET','POST'])
# def section_creation():
    # try:
    #     section_id = request.form.get('section_id')
    #     road_type_id = request.form.get('road_type_id')
    #     road_type = request.form.get('road_type')
    #     stage_id = request.form.get('stage_id')
    #     stage = request.form.get('stage')
    #     section_name = request.form.get('section_name')
    #     questions = request.form.get('questions')
    #     total = request.files
    #     dummy = []
    #     irc_help = ""
    #     all_sections = []
    #     file_saves = []
    #     choice = "choices"
    #     print(stage,questions)
    #     if stage is None or stage == "" or questions is None or questions == "" or section_name == "" or section_name is None or stage_id is None or stage_id == "" or road_type_id is None or road_type_id == "" or road_type == "" or road_type is None:
    #         return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
    #     query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
    #     params = (road_type_id,)
    #     road = execute_query(query0,params,fetch=True)
    #     if road == []:
    #         return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
    #     if road[0][0] != road_type:
    #         return jsonify({'statusCode':400,'status':'Invalid road_type'})
    #     stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
    #     params = (stage_id,)
    #     stage_fetch = execute_query(stage_query,params,fetch=True)
    #     if stage_fetch == []:
    #         return jsonify({'statusCode':400,'status':'Invalid stage'})
    #     # print('total',total,type(total))
    #     questions = json.loads(questions)
    #     # print(type(questions),questions)
    #     irc_help_tool = "irc_help_tool"
    #     file_save = []
    #     q_id = 1
    #     subq_ids = []
    #     sec_fetch = """SELECT section FROM question_bank WHERE section = %s"""
    #     params = (section_name,)
    #     org_sec = execute_query(sec_fetch,params,fetch=True)
    #     print(org_sec,'org')
    #     if org_sec == []:
    #         if section_id is None or section_id == "":
    #             query1 = """SELECT DISTINCT(section_id) FROM question_bank"""
    #             params = ()
    #             id = execute_query(query1,params,fetch=True)
    #             print(id,'id')
    #             for i in id:
    #                 char = ord(i[0])
    #                 all_sections.append(char)
    #             all_sections.sort()
    #             new_char =  int(all_sections[-1]) + 1
    #             section_id = chr(new_char)
    #             for i in questions:
    #                 dict = list(i.keys())
    #                 if "question" in dict and "issues_list" in dict and "data_type" in dict and "conditions" in dict and "functionality" in dict:
    #                     if "file_name" in dict:
    #                         dummy.append(i['file_name'])
    #                         org_path = parent_dir + "/" + irc_help_tool
    #                         bool1 = os.path.exists(org_path)
    #                         if bool1 is False:
    #                             os.makedirs(org_path)
    #                         org_q_id = str(road_type_id) + '.' + str(stage_id) + '.' + str(section_id) + "." + str(q_id)
    #                         print('sub-q-id',org_q_id)
    #                         user_path = os.path.join(org_path,str(org_q_id))
    #                         bool2 = os.path.exists(user_path)
    #                         if bool2 is False:
    #                             os.makedirs(user_path)
    #                         file = total.get(i["file_name"])
    #                         path = user_path+"/"+i["file_name"]
    #                         final_path = os.path.join(user_path,i["file_name"])
    #                         file.save(path)
    #                         file_save.append(path)
    #                         q_id += 1
    #                     else:
    #                         irc_help = i["irc_help_tool"]
    #                     question = i["question"]
    #                     issues_list = i["issues_list"]
    #                     data_type = i["data_type"]
    #                     conditions = i["conditions"]
    #                     functionality = i["functionality"]
    #                     choices = i["choices"]
    #                     query = """INSERT INTO question_bank (road_type_id,road_type,stage_id,stage,section_id,section,questions,issues_list,data_type,conditions,irc_help_tool,irc_path,q_id,functionality) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    #                     params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,irc_help,file_save,org_q_id,functionality,)   
    #                     execute_query(query,params) 
    #                     file_save = []
    #                     dummy = []        
    #                 else:
    #                     return jsonify({'statusCode':400,'status':'Incomplete details fill all the data in questions'})
    #                 a_id = 1
    #                 number = 1
    #                 if choices:
    #                     answer_type = choices.values()
    #                     answer_values = list(answer_type)
    #                     for i in answer_values:
    #                         the_options = i.values()
    #                         # print('the',the_options)
    #                         the_options = list(the_options)
    #                         key_values = list(i.keys())
    #                         if "option" in key_values and "dependency_dd" in key_values and "show_option" in key_values:
    #                             option = i['option']
    #                             dependency_dd = i['dependency_dd']
    #                             show_option = i['show_option']
    #                             if "file_name" in key_values:
    #                                 org_path = parent_dir + "/" + choice
    #                                 bool1 = os.path.exists(org_path)
    #                                 if bool1 is False:
    #                                     os.makedirs(org_path)
    #                                 user_path = os.path.join(org_path,str(org_q_id))
    #                                 sub_q_id = str(org_q_id) + "." + str(a_id)
    #                                 bool2 = os.path.exists(user_path)
    #                                 if bool2 is False:
    #                                     os.makedirs(user_path)
    #                                 file = total.get(i["file_name"])
    #                                 path = user_path+"/"+sub_q_id
    #                                 # final_path = os.path.join(user_path,i["file_name"])
    #                                 file.save(path)
    #                                 file_saves.append(path)
    #                                 mini_count = """SELECT MAX(s_no) FROM master_table"""
    #                                 params = (mini_count,)
    #                                 count = execute_query(mini_count,params,fetch=True)
    #                                 org_count = count[0][0] + 1
    #                                 ans = """SELECT q_id FROM question_bank WHERE section_id = %s"""
    #                                 params = (section_id,)
    #                                 sub_id_fetch = execute_query(ans,params,fetch=True)
    #                                 print('sub-q-id',org_q_id)
    #                                 mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option,img_path) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    #                                 params = (road_type_id,stage_id,section_id,org_q_id,sub_q_id,dependency_dd,option,org_count,True,file_saves)
    #                                 execute_query(mini,params)
    #                             else:
    #                                 print('else')
    #                                 mini_count = """SELECT MAX(s_no) FROM master_table"""
    #                                 params = (mini_count,)
    #                                 count = execute_query(mini_count,params,fetch=True)
    #                                 org_count = count[0][0] + 1
    #                                 ans = """SELECT q_id FROM question_bank WHERE section_id = %s"""
    #                                 params = (section_id,)
    #                                 sub_id_fetch = execute_query(ans,params,fetch=True)
    #                                 sub_q_id = str(org_q_id) + "." + str(a_id)
    #                                 mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
    #                                 params = (road_type_id,stage_id,section_id,org_q_id,sub_q_id,dependency_dd,option,org_count,show_option,)
    #                                 execute_query(mini,params)
    #                                 file_saves = []
    #                         else:
    #                             return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data in choice'}) 
    #                         number += 1
    #                         a_id += 1
    #                         file_saves = []
    #         return jsonify({'statusCode':200,'status':'Section created successfully'})
    #     else:
    #         return jsonify({'statusCode':404,'status':'Section already exists'})
    # except Exception as e:
    #     return jsonify({'statusCode':500,'status':'Failed to update data'+ str(e)})

@app.route('/section_creation',methods=['GET','POST'])
def section_creation():
    try:
        road_type_id = request.json.get('road_type_id')
        road_type = request.json.get('road_type')
        stage_id = request.json.get('stage_id')
        stage = request.json.get('stage')
        section_name = request.json.get('section_name')
        all_sections = []
        section_id = ""
        if stage is None or stage == "" or section_name == "" or section_name is None or stage_id is None or stage_id == "" or road_type_id is None or road_type_id == "" or road_type == "" or road_type is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        query0 = """SELECT road_type_dd FROM dropdown_values WHERE road_type_id = %s"""
        params = (road_type_id,)
        road = execute_query(query0,params,fetch=True)
        if road == []:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        if road[0][0] != road_type:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        stage_query = """SELECT stage_dd FROM dropdown_values WHERE stage_id = %s"""
        params = (stage_id,)
        stage_fetch = execute_query(stage_query,params,fetch=True)
        if stage_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid stage'})
        # sec_fetch = """SELECT section FROM question_bank WHERE section = %s"""
        # params = (section_name,)
        # org_sec = execute_query(sec_fetch,params,fetch=True)
        # print(org_sec,'org')
        # if org_sec == []:
        #     query1 = """SELECT DISTINCT(section_id) FROM question_bank"""
        #     params = ()
        #     id = execute_query(query1,params,fetch=True)
        #     print(id,'id')
        #     for i in id:
        #         char = ord(i[0])
        #         print('char',char)
        #         all_sections.append(char)
        #     all_sections.sort()
        #     print(all_sec tions,'list')
        #     new_char =  int(all_sections[-1]) + 1
        section_id = new_section()
        return jsonify({'statusCode':200,'status':'Section created successfully',"section_id":section_id})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/new_sec_question',methods= ['GET','POST'])
def new_sec_question():
    try:
        road_type_id = request.form.get('road_type_id') 
        road_type = request.form.get('road_type')
        stage_id = request.form.get('stage_id')
        stage = request.form.get('stage')
        section_id = request.form.get('section_id')
        section_name = request.form.get('section_name')
        question = request.form.get('question')
        issues_list = request.form.get('issues_list')
        field_type = request.form.get('field_type')
        conditions = request.form.get('conditions')
        data_type = request.form.get('data_type')
        irc_help_tool = request.form.get('irc_help_tool')
        functionality = request.form.get('functionality')
        master_table = request.form.get('master_table')
        choice = request.form.get('choice')
        q_no = request.form.get('q_no')
        total = request.files
        file_name = request.form.get('file_name')
        if master_table is None or master_table == "" or choice is None or choice == "" or functionality is None or functionality == "" or irc_help_tool is None or question is None or question == "" or issues_list == "" or issues_list is None or field_type is None or field_type == "" or conditions is None or conditions == "" or data_type is None or data_type == "" or stage is None or stage == "" or section_id is None or section_id == "" or section_name == "" or section_name is None or stage_id is None or stage_id == "" or road_type_id is None or road_type_id == "" or road_type == "" or road_type is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        file_save = []
        dummy = [] 
        check = []
        file_saves = []
        irc = "irc_help_tool"
        issues = issues_list.lower()
        master_table = master_table.lower()
        if master_table == 'true':
            master_table_value = 'Master_Table'
        else:
            master_table_value = ''
        if issues != "yes" and issues != "no":
            return jsonify({'statusCode':400,'status':'Invalid issues_list'})
        query0 = """SELECT DISTINCT(road_type_dd) FROM dropdown_values WHERE road_type_id = %s"""
        params = (road_type_id,)
        road = execute_query(query0,params,fetch=True)
        if road == []:
            return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
        if road[0][0] != road_type:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        stage_fetch = """SELECT DISTINCT(stage_dd) FROM dropdown_values WHERE stage_id = %s"""
        params = (stage_id,)
        stage_ver = execute_query(stage_fetch,params,fetch=True)
        if stage_ver == []:
            return jsonify({'statusCode':404,'status':'Invalid stage_id'})
        if stage_ver[0][0] != stage:
            return jsonify({'statusCode':404,'status':'Invalid stage'})
        # section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
        # params = (section_id,)
        # data3 = execute_query(section_fetch,params,fetch=True)
        # if data3 == []:
        #     return jsonify({'statusCode':400,'status':'Invalid section_id'})
        
        mini2 = """SELECT field_type FROM dropdown_values WHERE field_type = %s"""
        params=  (field_type,)
        field_type_fetch = execute_query(mini2,params,fetch=True)
        if field_type_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid field_type'})
        mini3 = """SELECT data_type FROM dropdown_values WHERE data_type = %s"""
        params=  (data_type,)
        data_type_fetch = execute_query(mini3,params,fetch=True)
        if data_type_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid data_type'})
        mini4 = """SELECT functionality FROM dropdown_values WHERE functionality = %s"""
        params=  (functionality,)
        functionality_fetch = execute_query(mini4,params,fetch=True)
        if functionality_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid functionality'})
        if q_no == 'first':
            section = section.lower()
            section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section = %s AND road_type_id = %s AND stage_id = %s"""
            params = (section_name,road_type_id,stage_id)
            data3 = execute_query(section_fetch,params,fetch=True)
            if data3 != []:
                return jsonify({'statusCode':400,'status':'Section already exists'})
            mini = """SELECT q_id FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            qid_fetch = execute_query(mini,params,fetch=True)
            if qid_fetch == []:
                qid = str(road_type_id) + '.' + str(stage_id) + '.' +  str(section_id) + '.' + str(1)
                sub_qid_format = qid
            else:
                return jsonify({'statusCode':400,'status':'Not a new section'})
        else:
            mini = """SELECT q_id FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            qid_fetch = execute_query(mini,params,fetch=True)
            if qid_fetch == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            for i in qid_fetch:
                id = i[0].split('.')
                dummy.append(int(id[3]))
                # dummy_prefix.append(id[0])
            dummy.sort()
            qid = str(id[0]) + '.' + str(id[1]) + '.' + str(id[2]) + '.' + str(int(dummy[-1]) + 1)
            sub_qid_format = qid
        if choice:
            choices = 'choices'
            choice = json.loads(choice)
            choice_list = list(choice.values())
            a = 1
            for i in choice_list:
                nested_list = list(i.keys())
                if "master_table" not in nested_list or 'dependency_dd' not in nested_list or 'show_option' not in nested_list:
                    return jsonify({'statusCode':400,'status':'Incomplete data please fill choice'})
        if file_name is not None:
            org_path = parent_dir + "/" + irc
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(qid))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            upload_path = os.path.join(user_path,str(file_name))
            file = total.get(file_name)
            file.save(upload_path)
            file_save.append(upload_path)
        if irc_help_tool != "":
            query = """INSERT INTO question_bank (road_type_id,road_type,stage_id,stage,section_id,section,questions,issues_list,data_type,conditions,irc_help_tool,irc_path,field_type,q_id,functionality,master_table) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,irc_help_tool,file_save,field_type,qid,functionality,master_table_value,)       
            execute_query(query,params)
        else:
            query = """INSERT INTO question_bank (road_type_id,road_type,stage_id,stage,section_id,section,questions,issues_list,data_type,conditions,irc_path,field_type,q_id,functionality,master_table) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,file_save,field_type,qid,functionality,master_table_value,)  
            execute_query(query,params)
        dummy = []
        dummy_prefix = []
        if choice:
            choices = 'choices'
            # choice = json.loads(choice)
            choice_list = list(choice.values())
            a = 1
            for i in choice_list:
                nested_list = list(i.keys())
                if "master_table" in nested_list and 'dependency_dd' in nested_list and 'show_option' in nested_list:
                    master_table = i['master_table']
                    dependency_dd = i['dependency_dd']
                    show_option = i['show_option']
                    if "file_name" in nested_list:    
                        the_file = i['file_name']
                        org_path = parent_dir + "/" + choices
                        bool1 = os.path.exists(org_path)
                        if bool1 is False:
                            os.makedirs(org_path)
                        user_path = os.path.join(org_path,str(qid))
                        bool2 = os.path.exists(user_path)
                        if bool2 is False:
                            os.makedirs(user_path)
                        file = total.get(the_file)
                        path = user_path+"/"+the_file
                        # final_path = os.path.join(user_path,i["file_name"])
                        file.save(path)
                        file_saves.append(path)
                        mini_count = """SELECT MAX(s_no) FROM master_table"""
                        params = (mini_count,)
                        count = execute_query(mini_count,params,fetch=True)
                        final_qid = qid.split('.')
                        mid_val = final_qid[1]
                        org_count = count[0][0] + 1
                        q_sub_id = sub_qid_format + '.' + str(a)
                        mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option,img_path) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                        params = (road_type_id,stage_id,section_id,qid,q_sub_id,dependency_dd,master_table,org_count,show_option,file_saves,)
                        execute_query(mini,params)
                        if 'irc_help' in nested_list:
                            ans_irc_help_tool = i['irc_help']
                            mini2 = """UPDATE master_table SET irc_help_tool = %s WHERE q_sub_id = %s"""
                            params = (ans_irc_help_tool,q_sub_id,)
                            execute_query(mini2,params)
                        a += 1
                        file_saves = []     
                    else:
                        mini_count = """SELECT MAX(s_no) FROM master_table"""
                        params = (mini_count,)
                        count = execute_query(mini_count,params,fetch=True)
                        final_qid = qid.split('.')
                        mid_val = final_qid[1]
                        org_count = count[0][0] + 1
                        q_sub_id = sub_qid_format + '.' + str(a)
                        mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                        params = (road_type_id,stage_id,section_id,qid,q_sub_id,dependency_dd,master_table,org_count,show_option,)
                        execute_query(mini,params)
                        if 'irc_help' in nested_list:
                            ans_irc_help_tool = i['irc_help']
                            mini2 = """UPDATE master_table SET irc_help_tool = %s WHERE q_sub_id = %s"""
                            params = (ans_irc_help_tool,q_sub_id,)
                            execute_query(mini2,params)
                        a += 1
                        file_saves = []
                else:
                    return jsonify({'statusCode':400,'status':'Incomplete data please fill all details inchoice'})
        return jsonify({'statusCode':200,'status':'question created successfully','qid':qid})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})  

@app.route('/add_question',methods= ['GET','POST'])
def add_question():
    try:
        road_type_id = request.form.get('road_type_id')
        road_type = request.form.get('road_type')
        stage_id = request.form.get('stage_id')
        stage = request.form.get('stage')
        section_id = request.form.get('section_id')
        section_name = request.form.get('section_name')
        question = request.form.get('question')
        issues_list = request.form.get('issues_list')
        field_type = request.form.get('field_type')
        conditions = request.form.get('conditions')
        data_type = request.form.get('data_type')
        irc_help_tool = request.form.get('irc_help_tool')
        master_table = request.form.get('master_table')
        functionality = request.form.get('functionality')
        choice = request.form.get('choice')
        total = request.files
        file_name = request.form.get('file_name')
        if master_table is None or master_table == "" or choice is None or choice == "" or functionality is None or functionality == "" or irc_help_tool is None or question is None or question == "" or issues_list == "" or issues_list is None or field_type is None or field_type == "" or conditions is None or conditions == "" or data_type is None or data_type == "" or stage is None or stage == "" or section_id is None or section_id == "" or section_name == "" or section_name is None or stage_id is None or stage_id == "" or road_type_id is None or road_type_id == "" or road_type == "" or road_type is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        file_save = []
        dummy = []
        dummy_prefix = []
        file_saves = []
        irc = "irc_help_tool"
        issues_list = issues_list.lower()
        master_table = master_table.lower()
        master_table = master_table.lower()
        if master_table == 'true':
            master_table_value = 'Master_Table'
        else:
            master_table_value = ''
        if issues_list != "yes" and issues_list != "no":
            return jsonify({'statusCode':400,'status':'Invalid issues_list'})
        query0 = """SELECT DISTINCT(road_type) FROM question_bank WHERE road_type_id = %s"""
        params = (road_type_id,)
        road = execute_query(query0,params,fetch=True)
        if road == []:
            return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
        if road[0][0] != road_type:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        stage_fetch = """SELECT DISTINCT(stage) FROM question_bank WHERE stage_id = %s"""
        params = (stage_id,)
        stage_ver = execute_query(stage_fetch,params,fetch=True)
        if stage_ver == []:
            return jsonify({'statusCode':404,'status':'Invalid stage_id'})
        if stage_ver[0][0] != stage:
            return jsonify({'statusCode':404,'status':'Invalid stage'})
        section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        data3 = execute_query(section_fetch,params,fetch=True)
        if data3 == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        if data3[0][0] != section_name:
            return jsonify({'statusCode':400,'status':'Invalid section_name'})
        
        mini2 = """SELECT field_type FROM dropdown_values WHERE field_type = %s"""
        params=  (field_type,)
        field_type_fetch = execute_query(mini2,params,fetch=True)
        if field_type_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid field_type'})
        mini3 = """SELECT data_type FROM dropdown_values WHERE data_type = %s"""
        params=  (data_type,)
        data_type_fetch = execute_query(mini3,params,fetch=True)
        if data_type_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid data_type'})
        mini4 = """SELECT functionality FROM dropdown_values WHERE functionality = %s"""
        params=  (functionality,)
        functionality_fetch = execute_query(mini4,params,fetch=True)
        if functionality_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid functionality'})
        mini = """SELECT q_id FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        qid_fetch = execute_query(mini,params,fetch=True)
        if qid_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        for i in qid_fetch:
            id = i[0].split('.')
            dummy.append(int(id[3]))
            # dummy_prefix.append(id[0])
        dummy.sort()
        qid = str(id[0]) + '.' + str(id[1]) + '.' + str(id[2]) + '.' + str(int(dummy[-1]) + 1)
        sub_qid_format = qid
        if choice:
            choices = 'choices'
            choice = json.loads(choice)
            choice_list = list(choice.values())
            a = 1
            for i in choice_list:
                nested_list = list(i.keys())
                if "master_table" not in nested_list or 'dependency_dd' not in nested_list or 'show_option' not in nested_list:
                    return jsonify({'statusCode':400,'status':'Incomplete data please fill choice'})
        if file_name is not None:
            org_path = parent_dir + "/" + irc
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(qid))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            upload_path = os.path.join(user_path,str(file_name))
            file = total.get(file_name)
            file.save(upload_path)
            file_save.append(upload_path)
        if irc_help_tool != "":
            query = """INSERT INTO question_bank (road_type_id,road_type,stage_id,stage,section_id,section,questions,issues_list,data_type,conditions,irc_help_tool,irc_path,field_type,q_id,functionality,master_table) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,irc_help_tool,file_save,field_type,qid,functionality,master_table_value,)       
            execute_query(query,params)
        else:
            query = """INSERT INTO question_bank (road_type_id,road_type,stage_id,stage,section_id,section,questions,issues_list,data_type,conditions,irc_path,field_type,q_id,functionality,master_table) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,file_save,field_type,qid,functionality,master_table_value,)  
            execute_query(query,params)
        dummy = []
        dummy_prefix = []
        if choice:
            choices = 'choices'
            # choice = json.loads(choice)
            choice_list = list(choice.values())
            a = 1
            for i in choice_list:
                nested_list = list(i.keys())
                if "master_table" in nested_list and 'dependency_dd' in nested_list and 'show_option' in nested_list:
                    master_table = i['master_table']
                    dependency_dd = i['dependency_dd']
                    show_option = i['show_option']
                    if "file_name" in nested_list:    
                        the_file = i['file_name']
                        org_path = parent_dir + "/" + choices
                        bool1 = os.path.exists(org_path)
                        if bool1 is False:
                            os.makedirs(org_path)
                        user_path = os.path.join(org_path,str(qid))
                        bool2 = os.path.exists(user_path)
                        if bool2 is False:
                            os.makedirs(user_path)
                        file = total.get(the_file)
                        path = user_path+"/"+the_file
                        # final_path = os.path.join(user_path,i["file_name"])
                        file.save(path)
                        file_saves.append(path)
                        mini_count = """SELECT MAX(s_no) FROM master_table"""
                        params = (mini_count,)
                        count = execute_query(mini_count,params,fetch=True)
                        final_qid = qid.split('.')
                        mid_val = final_qid[1]
                        org_count = count[0][0] + 1
                        q_sub_id = sub_qid_format + '.' + str(a)
                        mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option,img_path) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                        params = (road_type_id,stage_id,section_id,qid,q_sub_id,dependency_dd,master_table,org_count,show_option,file_saves)
                        execute_query(mini,params)
                        if 'irc_help' in nested_list:
                            ans_irc_help_tool = i['irc_help']
                            mini2 = """UPDATE master_table SET irc_help_tool = %s WHERE q_sub_id = %s"""
                            params = (ans_irc_help_tool,q_sub_id,)
                            execute_query(mini2,params)
                        a += 1
                        file_saves = []     
                    else:
                        mini_count = """SELECT MAX(s_no) FROM master_table"""
                        params = (mini_count,)
                        count = execute_query(mini_count,params,fetch=True)
                        final_qid = qid.split('.')
                        mid_val = final_qid[1]
                        org_count = count[0][0] + 1
                        q_sub_id = sub_qid_format + '.' + str(a)
                        mini = """INSERT INTO master_table (road_type_id,stage_id,section_id,q_id,q_sub_id,dependency_dd,master_table,s_no,show_option) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                        params = (road_type_id,stage_id,section_id,qid,q_sub_id,dependency_dd,master_table,org_count,show_option,)
                        execute_query(mini,params)
                        if 'irc_help' in nested_list:
                            ans_irc_help_tool = i['irc_help']
                            mini2 = """UPDATE master_table SET irc_help_tool = %s WHERE q_sub_id = %s"""
                            params = (ans_irc_help_tool,q_sub_id,)
                            execute_query(mini2,params)
                        a += 1
                        file_saves = []
                else:
                    return jsonify({'statusCode':400,'status':'Incomplete data please fill all details inchoice'})
        return jsonify({'statusCode':200,'status':'question created successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})  
    
@app.route('/edit_section',methods=['GET','POST'])
def edit_section():
    try:
        section_id = request.json.get('section_id')
        section_name = request.json.get('section_name')
        if section_id is None or section_id == "" or section_name is None or section_name == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all details inchoice'})
        query = """SELECT section_id,section FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        query2 = """UPDATE question_bank SET section = %s WHERE section_id = %s"""
        params = (section_name,section_id,)
        execute_query(query2,params)
        return jsonify({'statusCode':200,'status':'Section name edited successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'})   

@app.route('/edit_question',methods= ['GET','POST'])
def edit_question():
    try:
        road_type_id = request.form.get('road_type_id')
        road_type = request.form.get('road_type')
        stage_id = request.form.get('stage_id')
        stage = request.form.get('stage')
        section_id = request.form.get('section_id')
        section_name = request.form.get('section_name')
        qid = request.form.get('qid')
        question = request.form.get('question')
        issues_list = request.form.get('issues_list')
        field_type = request.form.get('field_type')
        conditions = request.form.get('conditions')
        data_type = request.form.get('data_type')
        irc_help_tool = request.form.get('irc_help_tool')
        functionality = request.form.get('functionality')
        total = request.files
        file_name = request.form.get('file_name')
        if qid is None or qid == "" or functionality is None or functionality == "" or irc_help_tool is None or question is None or question == "" or issues_list == "" or issues_list is None or field_type is None or field_type == "" or conditions is None or conditions == "" or data_type is None or data_type == "" or stage is None or stage == "" or section_id is None or section_id == "" or section_name == "" or section_name is None or stage_id is None or stage_id == "" or road_type_id is None or road_type_id == "" or road_type == "" or road_type is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        file_save = []
        file_saves = []
        irc = "irc_help_tool"
        issues_list.lower()
        if issues_list != "yes" and issues_list != "no":
            return jsonify({'statusCode':400,'status':'Invalid issues_list'})
        query0 = """SELECT DISTINCT(road_type_dd) FROM dropdown_values WHERE road_type_id = %s"""
        params = (road_type_id,)
        road = execute_query(query0,params,fetch=True)
        if road == []:
            return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
        if road[0][0] != road_type:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        stage_fetch = """SELECT DISTINCT(stage_dd) FROM dropdown_values WHERE stage_id = %s"""
        params = (stage_id,)
        stage_ver = execute_query(stage_fetch,params,fetch=True)
        if stage_ver == []:
            return jsonify({'statusCode':404,'status':'Invalid stage_id'})
        if stage_ver[0][0] != stage:
            return jsonify({'statusCode':404,'status':'Invalid stage'})
        section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        data3 = execute_query(section_fetch,params,fetch=True)
        if data3 == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        if data3[0][0] != section_name:
            return jsonify({'statusCode':400,'status':'Invalid section_name'})
        mini2 = """SELECT DISTINCT(field_type) FROM question_bank WHERE field_type = %s"""
        params=  (field_type,)
        field_type_fetch = execute_query(mini2,params,fetch=True)
        if field_type_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid field_type'})
        mini3 = """SELECT DISTINCT(data_type) FROM dropdown_values WHERE data_type = %s"""
        params=  (data_type,)
        data_type_fetch = execute_query(mini3,params,fetch=True)
        if data_type_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid data_type'})
        mini4 = """SELECT DISTINCT(functionality) FROM question_bank WHERE functionality = %s"""
        params=  (functionality,)
        functionality_fetch = execute_query(mini4,params,fetch=True)
        if functionality_fetch == []:
            return jsonify({'statusCode':400,'status':'Invalid functionality'})
        mini5 = """SELECT q_id FROM question_bank WHERE q_id = %s"""
        params = (qid,)
        verify = execute_query(mini5,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid qid'})
        if file_name is not None:
            org_path = parent_dir + "/" + irc
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(qid))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            upload_path = os.path.join(user_path,str(file_name))
            file = total.get(file_name)
            file.save(upload_path) 
            file_save.append(upload_path)
        if irc_help_tool != "":
            query = """UPDATE question_bank SET road_type_id = %s,road_type = %s,stage_id = %s,stage = %s,section_id = %s,section = %s,questions = %s,issues_list = %s,data_type = %s,conditions = %s,irc_help_tool = %s,irc_path = %s,field_type = %s,q_id = %s,functionality = %s WHERE q_id = %s"""
            params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,irc_help_tool,file_save,field_type,qid,functionality,qid,)       
            execute_query(query,params)
        else:
            query = """UPDATE question_bank SET road_type_id = %s,road_type = %s,stage_id = %s,stage = %s,section_id = %s,section = %s,questions = %s,issues_list = %s,data_type = %s,conditions = %s,irc_help_tool = %s,irc_path = %s,field_type = %s,q_id = %s,functionality = %s WHERE q_id = %s"""
            params = (road_type_id,road_type,stage_id,stage,section_id,section_name,question,issues_list,data_type,conditions,file_save,field_type,qid,functionality,qid,)  
            execute_query(query,params)
        return jsonify({'statusCode':200,'status':'Question edited successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})  

@app.route('/audit_assigned_list',methods = ['GET','POST'])
def audit_assigned_list():
    try:
        audit_type_id = request.json.get('audit_type_id')
        audit_id = request.json.get('audit_id')
        dict = {}
        dict_params = []
        if (audit_type_id == "" and audit_id) or (audit_id == "" and audit_type_id):
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        if (audit_type_id is None or audit_type_id == "") and (audit_id is None or audit_id == ""):
            query = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,
                        audit_assignment.start_date,audit_assignment.submit_date,
                        audit_assignment.auditor,
                        audit_assignment.type_of_audit,
                        audit_assignment.audit_plan_id,
                        audit_assignment.audit_id,
                        audit_assignment.created_by,
                        audit_assignment.status,
                        audit_assignment.auditor_stretch,
                        audit_assignment.auditor,users.first_name,audit_assignment.prev_auditor FROM audit_assignment LEFT JOIN users 
                        ON audit_assignment.auditor = users.user_id"""
            params = ()
            data = execute_query(query,params,fetch=True)
            for i in data:
                dict['audit_type'] = i[0]
                dict['stretch_name'] = i[1]
                dict['start_date'] = i[2]
                dict['submit_date'] = i[3]
                dict['auditor'] = i[12]
                dict['type_of_audit'] = i[5]
                dict['audit_plan_id'] = i[6]
                dict['audit_id'] = i[7]
                dict['created_by'] = i[8]
                dict['status'] = i[9]
                dict['auditor_stretch'] = i[10]
                dict['prev_auditor'] = i[13]
                query1 = """SELECT state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                params = (i[6],i[0],)
                data2 = execute_query(query1,params,fetch=True)
                dict['state'] = data2[0][0]
                dict['district_name'] = data2[0][1]
                dict['name_of_road'] = data2[0][2]
                dict['road_number'] = data2[0][3]
                dict['no_of_lanes'] = data2[0][4]
                dict['road_owning_agency'] = data2[0][5]
                dict['chainage_start'] = data2[0][6]
                dict['chainage_end'] = data2[0][7]
                dict['location_start'] = data2[0][8]
                dict['location_end'] = data2[0][9]
                dict['latitude_start'] = data2[0][10]
                dict['latitude_end'] = data2[0][11]
                dict['stretch_length'] = data2[0][12]
                dict_params.append(dict)
                dict = {}
        else:
            query = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,
                        audit_assignment.start_date,audit_assignment.submit_date,
                        audit_assignment.auditor,
                        audit_assignment.type_of_audit,
                        audit_assignment.audit_plan_id,
                        audit_assignment.audit_id,
                        audit_assignment.created_by,
                        audit_assignment.status,
                        audit_assignment.auditor_stretch,
                        audit_assignment.auditor,users.first_name,audit_assignment.prev_auditor FROM audit_assignment LEFT JOIN users 
                        ON audit_assignment.auditor = users.user_id WHERE audit_type_id = %s AND audit_id = %s"""
            params = (audit_type_id,audit_id,)
            data = execute_query(query,params,fetch=True)
            for i in data:
                dict['audit_type_id'] = i[0]
                dict['stretch_name'] = i[1]
                dict['start_date'] = i[2]
                dict['submit_date'] = i[3]
                dict['auditor'] = i[12]
                dict['type_of_audit'] = i[5]
                dict['audit_plan_id'] = i[6]
                dict['audit_id'] = i[7]
                dict['created_by'] = i[8]
                dict['status'] = i[9]
                dict['auditor_stretch'] = i[10]
                dict['prev_auditor'] = i[13]
                query1 = """SELECT state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                params = (i[6],i[0],)
                data2 = execute_query(query1,params,fetch=True)
                dict['state'] = data2[0][0]
                dict['district_name'] = data2[0][1]
                dict['name_of_road'] = data2[0][2]
                dict['road_number'] = data2[0][3]
                dict['no_of_lanes'] = data2[0][4]
                dict['road_owning_agency'] = data2[0][5]
                dict['chainage_start'] = data2[0][6]
                dict['chainage_end'] = data2[0][7]
                dict['location_start'] = data2[0][8]
                dict['location_end'] = data2[0][9]
                dict['latitude_start'] = data2[0][10]
                dict['latitude_end'] = data2[0][11]
                dict['stretch_length'] = data2[0][12]
                dict_params.append(dict)
                dict = {}
            if dict_params == []:
                return jsonify({'statusCode':400,'status':'audit data does not exist'})
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/reassign_audit',methods = ['GET','POST'])
def reassign_audit():
    try:
        audit_type_id = request.json.get('audit_type_id')
        audit_id = request.json.get ('audit_id')
        assign_to = request.json.get('assign_to')
        dict = {}
        if audit_type_id == "" or audit_type_id is None or audit_id == "" or audit_id is None or assign_to is None or assign_to == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        else:
            query = """SELECT auditor_stretch,auditor FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            data = execute_query(query,params,fetch=True)
            query2 = """SELECT audit_type_id FROM audit_assignment WHERE audit_type_id = %s"""
            params = (audit_type_id,)
            type_id = execute_query(query2,params,fetch=True)
            if type_id == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            else:
                auditor_stretch = data[0][0]
                prev_auditor = data[0][1]
                value = list(auditor_stretch.values())
                dict[assign_to] = value[0]
                mini = """SELECT first_name FROM users WHERE user_id = %s"""
                params = (assign_to,)
                first_name = execute_query(mini,params,fetch=True)
                if first_name == []:
                    return jsonify({'statusCode':400,'status':'Invalid user_id in assign_to'})
                else:
                    query0 = """SELECT status FROM audit_assignment WHERE audit_id = %s"""
                    params = (audit_id,)
                    statuschck = execute_query(query0,params,fetch=True)
                    if statuschck[0][0] == 'In Progress' or statuschck[0][0] == 'Completed':
                        status = "Audit is {statuschck}".format(statuschck=statuschck[0][0])
                        return jsonify({'statusCode':104,'status':status})
                    else:
                        query1 = """UPDATE audit_assignment SET auditor = %s,auditor_stretch = %s,prev_auditor = %s WHERE audit_id = %s AND audit_type_id = %s"""
                        params = (assign_to,json.dumps(dict),prev_auditor,audit_id,audit_type_id,)
                        execute_query(query1,params)
                        return jsonify({'statusCode':200,'status':'Successfully reassigned audit'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
@app.route('/question_id_dropdown',methods = ['GET','POST'])
def question_id_dropdown():
    try:
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        section_id = request.json.get('section_id')
        dict = {}
        dict_params = []
        dummy = {}
        if road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or section_id is None or section_id == "" :
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        else:
            query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
            params = (road_type_id,)
            road_type = execute_query(query0,params,fetch=True)
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type'})
            section_fetch = """SELECT DISTINCT(section_id) FROM master_table WHERE section_id = %s"""
            params = (section_id,)
            data3 = execute_query(section_fetch,params,fetch=True)
            if data3 == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            if stage == []:
                return jsonify({'statusCode':400,'status':'Invalid stage'})
            query = """SELECT q_id,q_sub_id,master_table FROM master_table WHERE road_type_id = %s AND stage_id = %s AND section_id = %s"""
            params = (road_type_id,stage_id,section_id,)
            id = execute_query(query,params,fetch=True)
            if id == []:
                return jsonify({'statusCode':400,'status':'q_id,q_sub_id for this combination does not exist'})
            else:
                for i in id:
                    for j in id:
                        if i[0] == j[0]:
                            dummy[j[1]] = j[2]
                        dict[i[0]] = dummy
                    dummy = {}
                dict_params.append(dict)
                dict = {} 
                return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'})
    
@app.route('/retrieval_id_data',methods =['GET','POST'])
def retrieval_id_data():
    try:
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        section_id = request.json.get('section_id')
        dict = {}
        dict_params = []
        query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
        params = (road_type_id,)
        road_type = execute_query(query0,params,fetch=True)
        section_idfetch = """SELECT DISTINCT(section_id) FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        data3 = execute_query(section_idfetch,params,fetch=True)
        stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
        params = (stage_id,)
        stage = execute_query(stage_query,params,fetch=True)
        if stage == []:
                return jsonify({'statusCode':400,'status':'Invalid stage'})
        if data3 == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        if road_type == []:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        query = """SELECT q_id,q_sub_id FROM master_table WHERE road_type_id = %s AND stage_id = %s AND section_id = %s"""
        params = (road_type_id,stage_id,section_id,)
        ids = execute_query(query,params,fetch=True)
        if ids == []:
            return jsonify({'statusCode':400,'status':'q_id for this combination does not exist'})
        else:
            for i in ids:
                dict["q_id"] = i[0]
                dict["q_sub_id"] = i[1]
                dict_params.append(dict)
                dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'})

@app.route('/retrieval_id_creation',methods = ['GET','POST'])
def retrieval_id_creation():
    try:
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        section_id = request.json.get('section_id')
        section = request.json.get('section')
        question_ids = request.json.get('question_ids')
        retrieval_id = request.json.get('retrieval_id')
        if section is None or section == "" or road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or section_id is None or section_id == "" or question_ids == "" or question_ids is None or retrieval_id is None or retrieval_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        else: 
            query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
            params = (road_type_id,)
            road_type = execute_query(query0,params,fetch=True)
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type'})
            section_idfetch = """SELECT DISTINCT(section_id) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            data3 = execute_query(section_idfetch,params,fetch=True)
            if data3 == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            sec = execute_query(section_fetch,params,fetch=True)
            stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            ret_id = """SELECT retrieval_id FROM retrieval_id WHERE retrieval_id = %s"""
            params = (retrieval_id,)
            the_id = execute_query(ret_id,params,fetch=True)
            if stage == []:
                return jsonify({'statusCode':400,'status':'Invalid stage'})
            if sec == []:
                return jsonify({'status':400,'status':'Invalid section_id'})
            if sec[0][0] != section:
                return jsonify({'status':400,'status':'Invalid section'})
            else: 
                if the_id == []: 
                    if type(question_ids) == list:
                        id = []
                        for i in question_ids:    
                            keys = list(i.keys())
                            if "q_id" not in keys or "q_sub_id" not in keys:
                                return jsonify({'statusCode':400,'status':'Incomplete data q_id or q_sub_id not in question_ids'})
                            else:
                                id.append(i["q_sub_id"])
                        retre = ".".join(id)
                        org_retrieval = retre
                        if org_retrieval != retrieval_id:
                            return jsonify({'statusCode':200,'status':'Invalid retrieval_id'})
                        else:
                            for i in question_ids:
                                keys = list(i.keys())
                                if "q_id" in keys and "q_sub_id" in keys:
                                    q_id = i["q_id"]
                                    q_sub_id = i["q_sub_id"]
                                    mini = """SELECT questions FROM question_bank WHERE q_id = %s"""
                                    params = (q_id,)
                                    que = execute_query(mini,params,fetch=True)
                                    if que == []:
                                        return jsonify({'statusCode':400,'status':'Invalid q_id'})
                                    sub_mini = """SELECT q_sub_id FROM master_table WHERE q_sub_id = %s"""
                                    params = (q_sub_id,)
                                    sub_que = execute_query(sub_mini,params,fetch=True)
                                    if sub_que == []:
                                        return jsonify({'statusCode':400,'status':'Invalid q_sub_id'})
                                    mini2 = """SELECT master_table FROM master_table WHERE q_id = %s AND q_sub_id = %s"""
                                    params = (q_id,q_sub_id,)
                                    sub_q = execute_query(mini2,params,fetch=True)
                                    if sub_q == []:
                                        return jsonify({'statusCode':404,'status':'master_table data does not exist'})
                                    query = """INSERT INTO retrieval_id (road_type_id,stage_id,section_id,section,retrieval_id,q_id,q_sub_id,issue,master_table) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                                    params = (road_type_id,stage_id,section_id,section,retrieval_id,q_id,q_sub_id,que[0][0],sub_q[0][0],)
                                    execute_query(query,params)
                                else:
                                    return jsonify({'statusCode':400,'status':'Incomplete data q_id or q_sub_id not in question_ids'})
                            return jsonify({'statusCode':200,'status':'Retrieval id created successfully'})
                    else:
                        return jsonify({'statusCode':400,'status':'Invalid input type for question_ids'})
                else:
                    return jsonify({'status':404,'status':'retrievel_id already exists'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to create retrieval_id'})

@app.route('/retrieval_id_list_pagewise',methods =['GET','POST'])
def retrieval_id_list_pagewise():
    try:
        start_row = request.json.get('start_row')
        end_row = request.json.get('end_row')
        dict = {}
        dict_params = []
        if start_row is None or start_row == "" or end_row == "" or end_row is None:
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        if type(start_row) != int or type(end_row) != int:
            return jsonify({'statusCode':400,'status':'Invalid input type for start_row or end_row'})
        query = """SELECT retrieval_id.s_no,retrieval_id.road_type_id,retrieval_id.stage_id,retrieval_id.section_id,retrieval_id.section,retrieval_id.retrieval_id,retrieval_id.q_id,retrieval_id.q_sub_id,retrieval_id.master_table,question_bank.questions,question_bank.road_type,question_bank.stage
        FROM retrieval_id INNER JOIN question_bank ON retrieval_id.q_id = question_bank.q_id WHERE s_no BETWEEN %s AND %s ORDER BY s_no ASC"""
        params = (start_row,end_row,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'retrieval_id data does not exist'})
        else:
            for i in data:
                dict['s_no'] = i[0]
                dict['road_type_id'] = i[1]
                dict['road_type'] = i[10]
                dict['stage_id'] = i[2]
                dict['stage'] = i[11]
                dict['question'] = i[9]
                dict['section_id'] = i[3]
                dict['section'] = i[4]
                dict['retrieval_id'] = i[5]
                dict['question_id'] = i[6]
                dict['q_sub_id'] = i[7]
                dict['master_table'] = i[8]
                dict_params.append(dict)
                dict = {}
            return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch retrieval_id'} )
    
@app.route('/retrieval_id_list',methods =['GET','POST'])
def retrieval_id_list():
    try:
        dict = {}
        dict_params = []
        query = """SELECT retrieval_id.s_no,retrieval_id.road_type_id,retrieval_id.stage_id,retrieval_id.section_id,retrieval_id.section,retrieval_id.retrieval_id,retrieval_id.q_id,retrieval_id.q_sub_id,retrieval_id.master_table,question_bank.questions,question_bank.road_type,question_bank.stage
        FROM retrieval_id INNER JOIN question_bank ON retrieval_id.q_id = question_bank.q_id"""
        params = ()
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'retrieval_id data does not exist'})
        else:
            for i in data:
                dict['s_no'] = i[0]
                dict['road_type_id'] = i[1]
                dict['road_type'] = i[10]
                dict['stage_id'] = i[2]
                dict['stage'] = i[11]
                dict['question'] = i[9]
                dict['section_id'] = i[3]
                dict['section'] = i[4]
                dict['retrieval_id'] = i[5]
                dict['question_id'] = i[6]
                dict['q_sub_id'] = i[7]
                dict['master_table'] = i[8]
                dict_params.append(dict)
                dict = {}
            return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch retrieval_id'} )
    
@app.route('/rsa_suggestion',methods=['GET','POST'])
def rsa_suggestion():
    try:
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        section_id = request.json.get('section_id')
        dict = {}
        dict_params = []
        if road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or section_id is None or section_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        dummy = []
        query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
        params = (road_type_id,)
        road_type = execute_query(query0,params,fetch=True)
        if road_type == []:
            return jsonify({'statusCode':400,'status':'Invalid road_type'})
        section_idfetch = """SELECT DISTINCT(section_id) FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        data3 = execute_query(section_idfetch,params,fetch=True)
        if data3 == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
        params = (section_id,)
        sec = execute_query(section_fetch,params,fetch=True)
        stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
        params = (stage_id,)
        stage = execute_query(stage_query,params,fetch=True)
        if stage == []:
            return jsonify({'statusCode':400,'status':'Invalid stage'})
        if sec == []:
            return jsonify({'status':400,'status':'Invalid section_id'})
        query = """SELECT retrieval_id, ARRAY_AGG(master_table) AS master_table FROM retrieval_id WHERE road_type_id = %s AND stage_id = %s AND section_id = %s GROUP BY retrieval_id"""
        params = (road_type_id,stage_id,section_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':105,'status':'retrieval_id for this combination does not exist'})
        for i in data:
            dict['retrieval_id'] = i[0]
            dict['question'] = i[1]
            dict_params.append(dict)
            dict = {}
        return jsonify({'statusCode':200,'status':'Successfully fetched data','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch retrieval_id'+ str(e)})
    
@app.route('/suggestion_mapping',methods = ['GET','POST'])
def suggestion_mapping():
    try:
        road_type_id = request.form.get('road_type_id')
        stage_id = request.form.get('stage_id')
        section = request.form.get('section')
        section_id = request.form.get('section_id')
        retrieval_id = request.form.get('retrieval_id')
        issue = request.form.get('issue')
        suggestion_id = request.form.get('suggestion_id')
        suggestion =  request.form.get('suggestion')
        rsilt_category = request.form.get('rsilt_category')
        rsilt_road_type = request.form.get('rsilt_road_type')
        file_name = request.form.get('file_name')                                        
        total = request.files
        Suggestion = "Suggestion Mapping"
        query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
        params = (road_type_id,)
        road_type = execute_query(query0,params,fetch=True)
        if rsilt_road_type == "" or rsilt_road_type is None or rsilt_category is None or rsilt_category == "" or road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or section_id is None or section_id == "" or section == "" or section is None or retrieval_id is None or retrieval_id == "" or issue == "" or issue is None or suggestion_id is None or suggestion_id == "" or suggestion is None or suggestion == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        else:
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type'})
            section_idfetch = """SELECT DISTINCT(section_id) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            data3 = execute_query(section_idfetch,params,fetch=True) 
            if data3 == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            sec = execute_query(section_fetch,params,fetch=True)
            stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            ret_query = """SELECT retrieval_id FROM retrieval_id WHERE retrieval_id = %s"""
            params = (retrieval_id,)
            check_ret = execute_query(ret_query,params,fetch=True)
            if check_ret == []:
                return jsonify({'statusCode':400,'status':'Invalid retrieval_id'})
            # sug_query = """SELECT suggestion_id FROM suggestion_mapping WHERE suggestion_id = %s"""
            # params = (suggestion_id,)
            # check_sug = execute_query(sug_query,params,fetch=True)
            # if check_sug == []:
                # return jsonify({'statusCode':400,'status':'Invalid suggestion_id'})
            if stage == []:
                    return jsonify({'statusCode':400,'status':'Invalid stage'})
            if sec[0][0] != section:
                return jsonify({'status':400,'status':'Invalid section_name'})
            # mini = """SELECT retrieval_id FROM suggestion_mapping WHERE retrieval_id = %s"""
            # params = (retrieval_id,)
            # sug_id = execute_query(mini,params,fetch=True)
            # if sug_id != []:
            #     return jsonify({'statusCode':400,'status':'retrieval_id already exists'})
            if file_name is not None or file_name:
                file_type = file_name.split('.')[1]
                org_path = parent_dir + "/" + Suggestion
                bool1 = os.path.exists(org_path)
                if bool1 is False:
                    os.makedirs(org_path)
                user_path = os.path.join(org_path,str(retrieval_id))
                bool2 = os.path.exists(user_path)
                if bool2 is False:
                    os.makedirs(user_path)
                upload_path = os.path.join(user_path,str(suggestion_id))
                file = total.get(file_name)
                path = upload_path+"."+file_type
                file.save(path)
            count_fetch = """SELECT MAX(s_no) FROM suggestion_mapping"""
            params = ()
            count = execute_query(count_fetch,params,fetch=True)
            org_count = count[0][0] + 1
            if file_name:
                query = """INSERT INTO suggestion_mapping (road_type_id,stage_id,section,section_id,retrieval_id,issue,suggestion_id,suggestion,s_no,rsilt_category,rsilt_road_type,image_path) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                params = (road_type_id,stage_id,section,section_id,retrieval_id,issue,suggestion_id,suggestion,org_count,rsilt_category,rsilt_road_type,str(path))
            else:
                query = """INSERT INTO suggestion_mapping (road_type_id,stage_id,section,section_id,retrieval_id,issue,suggestion_id,suggestion,s_no,rsilt_category,rsilt_road_type) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                params = (road_type_id,stage_id,section,section_id,retrieval_id,issue,suggestion_id,suggestion,org_count,rsilt_category,rsilt_road_type,)
            execute_query(query,params)
            return jsonify({'statusCode':200,'status':'Successfully linked issue and suggestion'})
            # else:
            #     return jsonify({'statusCode':105,'status':'retrieval_id and suggestion_id does not match'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/suggestion_mapping_edit',methods = ['GET','POST'])
def suggestion_mapping_edit():
    try:
        road_type_id = request.form.get('road_type_id')
        stage_id = request.form.get('stage_id')
        section = request.form.get('section')
        section_id = request.form.get('section_id')
        retrieval_id = request.form.get('retrieval_id')
        issue = request.form.get('issue')
        suggestion_id = request.form.get('suggestion_id')
        suggestion =  request.form.get('suggestion')
        rsilt_category = request.form.get('rsilt_category')
        rsilt_road_type = request.form.get('rsilt_road_type')
        file_name = request.form.get('file_name')
        s_no = request.form.get('s_no')
        total = request.files
        Suggestion = "Suggestion Mapping"
        query0 = """SELECT road_type FROM question_bank WHERE road_type_id = %s"""
        params = (road_type_id,)
        road_type = execute_query(query0,params,fetch=True)
        if rsilt_road_type == "" or rsilt_road_type is None or rsilt_category is None or rsilt_category == "" or road_type_id == "" or road_type_id is None or stage_id == "" or stage_id is None or section_id is None or section_id == "" or section == "" or section is None or retrieval_id is None or retrieval_id == "" or issue == "" or issue is None or suggestion_id is None or suggestion_id == "" or suggestion is None or suggestion == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        else:
            if road_type == []:
                return jsonify({'statusCode':400,'status':'Invalid road_type'})
            section_idfetch = """SELECT DISTINCT(section_id) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            data3 = execute_query(section_idfetch,params,fetch=True)
            if data3 == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            section_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            sec = execute_query(section_fetch,params,fetch=True)
            stage_query = """SELECT stage FROM question_bank WHERE stage_id = %s"""
            params = (stage_id,)
            stage = execute_query(stage_query,params,fetch=True)
            ret_query = """SELECT retrieval_id FROM retrieval_id WHERE retrieval_id = %s"""
            params = (retrieval_id,)
            check_ret = execute_query(ret_query,params,fetch=True)
            if check_ret == []:
                return jsonify({'statusCode':400,'status':'Invalid retrieval_id'})
            # sug_query = """SELECT suggestion_id FROM suggestion_mapping WHERE suggestion_id = %s"""
            # params = (suggestion_id,)
            # check_sug = execute_query(sug_query,params,fetch=True)
            # if check_sug == []:
            #     return jsonify({'statusCode':400,'status':'Invalid suggestion_id'})
            if stage == []:
                    return jsonify({'statusCode':400,'status':'Invalid stage'})
            if sec[0][0] != section:
                return jsonify({'status':400,'status':'Invalid section_name'})
            # mini = """SELECT retrieval_id FROM suggestion_mapping WHERE retrieval_id = %s"""
            # params = (retrieval_id,)
            # sug_id = execute_query(mini,params,fetch=True)
            # if sug_id != []:
            #     return jsonify({'statusCode':400,'status':'retrieval_id already exists'})
            # if retrieval_id == suggestion_id:
            if file_name is not None or file_name:
                file_type = file_name.split('.')[1]
                org_path = parent_dir + "/" + Suggestion
                bool1 = os.path.exists(org_path)
                if bool1 is False:
                    os.makedirs(org_path)
                user_path = os.path.join(org_path,str(retrieval_id))
                bool2 = os.path.exists(user_path)
                if bool2 is False:
                    os.makedirs(user_path)
                upload_path = os.path.join(user_path,str(suggestion_id))
                file = total.get(file_name)
                path = upload_path+"."+file_type
                file.save(path)
            count_fetch = """SELECT MAX(s_no) FROM suggestion_mapping"""
            params = ()
            count = execute_query(count_fetch,params,fetch=True)
            org_count = count[0][0] + 1
            if file_name:
                query = """UPDATE suggestion_mapping SET road_type_id = %s,stage_id = %s,section = %s,section_id = %s,retrieval_id = %s
                ,issue = %s,suggestion_id = %s,suggestion = %s,rsilt_category = %s,rsilt_road_type = %s,image_path = %s WHERE s_no = %s"""
                params = (road_type_id,stage_id,section,section_id,retrieval_id,issue,suggestion_id,suggestion,rsilt_category,rsilt_road_type,str(path),s_no,)
            else:
                query = """UPDATE suggestion_mapping SET road_type_id = %s,stage_id = %s,section = %s,section_id = %s,retrieval_id = %s
                ,issue = %s,suggestion_id = %s,suggestion = %s,rsilt_category = %s,rsilt_road_type = %s WHERE s_no = %s"""
                params = (road_type_id,stage_id,section,section_id,retrieval_id,issue,suggestion_id,suggestion,rsilt_category,rsilt_road_type,s_no,)
            execute_query(query,params)
            return jsonify({'statusCode':200,'status':'Successfully updated suggestion mapping table'})
        # else:
        #     return jsonify({'statusCode':105,'status':'retrieval_id and suggestion_id does not match'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
@app.route('/suggestion_mapping_list',methods =['GET','POST'])
def suggestion_mapping_list():
    try:
        dict = {}
        dict_params = []
        query = """SELECT DISTINCT(suggestion_mapping.s_no),suggestion_mapping.issue,suggestion_mapping.suggestion_id,suggestion_mapping.suggestion,suggestion_mapping.road_type_id,suggestion_mapping.stage_id,suggestion_mapping.section_id,suggestion_mapping.section,suggestion_mapping.retrieval_id,question_bank.road_type,question_bank.stage,
        suggestion_mapping.rsilt_category,suggestion_mapping.rsilt_road_type FROM suggestion_mapping INNER JOIN question_bank ON suggestion_mapping.road_type_id = question_bank.road_type_id AND suggestion_mapping.stage_id = question_bank.stage_id AND suggestion_mapping.section_id = question_bank.section_id ORDER BY suggestion_mapping.s_no ASC"""
        params = ()
        data = execute_query(query,params,fetch=True)
        for i in data:
            if i is None:
                return jsonify({'statusCode':404,'status':'suggestion_mapping data does not exist'})
            dict['question'] = i[1]
            dict['suggestion_id'] = i[2]
            dict['suggestion'] = i[3]
            dict['road_type_id'] = i[4]
            dict['stage_id'] = i[5]
            dict['section_id'] = i[6]
            dict['section'] = i[7]
            dict['retrieval_id'] = i[8]
            dict['road_type'] = i[9]
            dict['stage'] = i[10]
            dict['s_no'] = i[0]
            dict['rsilt_category'] = i[11]
            dict['rsilt_road_type'] = i[12]
            dict_params.append(dict)
            dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch retrieval_id' + str(e)}) 

#for AE

@app.route('/ae_dashboard',methods= ['GET','POST'])
def ae_dashboard():           
    try:
        user_id = request.json.get('user_id')
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        dict = {}
        dict_params = []
        chck = """SELECT user_id FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify1 = execute_query(chck,params,fetch=True)
        if verify1 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        verify = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        role = execute_query(verify,params,fetch=True)
        if role[0][0] != 'AE':
            return jsonify({'statusCode':105,'status':'Invalid user_id'})
        
        query = """SELECT audit_type_id,stretch_name,start_date,submit_date,auditor,type_of_audit,audit_plan_id,audit_id,created_by,status,auditor_stretch,auditor FROM audit_assignment WHERE ae_userid = %s AND status = %s"""
        params = (user_id,'Report Submitted',)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'Data does not exist'})
        for j in data:
            if j is not None:
                dict['audit_type'] = j[0]
                dict['stretch_name'] = j[1]
                dict['start_date'] = j[2]
                dict['submit_date'] = j[3]
                dict['auditor'] = j[4]
                dict['type_of_audit'] = j[5]
                dict['audit_plan_id'] = j[6]
                dict['audit_id'] = j[7]
                dict['assigned_by'] = j[8]
                dict['status'] = j[9]
                dict['auditor_stretch'] = j[10]
                dict['auditor'] = j[11]
                query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                params = (j[6],j[0],)
                data2 = execute_query(query1,params,fetch=True)
                dict['state'] = data2[0][0]
                dict['district_name'] = data2[0][1]
                dict['name_of_road'] = data2[0][2]
                dict['road_number'] = data2[0][3]
                dict['no_of_lanes'] = data2[0][4]
                dict['road_owning_agency'] = data2[0][5]
                dict['chainage_start'] = data2[0][6]
                dict['chainage_end'] = data2[0][7]
                dict['location_start'] = data2[0][8]
                dict['location_end'] = data2[0][9]
                dict['latitude_start'] = data2[0][10]
                dict['latitude_end'] = data2[0][11]
                dict['stretch_length'] = data2[0][12]
                dict_params.append(dict)
                dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'})
    

#for lead audit
@app.route('/auditor_dashboard',methods= ['GET','POST'])
def auditor_dashboard():           
    try:
        user_id = request.json.get('user_id')
        filter = request.json.get('filter')
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data','message':'please fill all the details'})
        dict = {}
        dict_params = []
        chck = """SELECT user_id FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify1 = execute_query(chck,params,fetch=True)
        if verify1 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        query = """SELECT audit_id FROM audit_assignment WHERE auditor = %s"""
        params = (user_id,)
        audit_id = execute_query(query,params,fetch=True)
        status = ['Audit Assigned','In Progress','Audit Completed']
        if audit_id == []:
            return jsonify({'statusCode':404,'status':'audit_id data does not exist'})
        else:
            verify = """SELECT role FROM users WHERE user_id = %s"""
            params = (user_id,)
            role = execute_query(verify,params,fetch=True)
            if role[0][0] != 'Auditor':
                return jsonify({'statusCode':105,'status':'Invalid auditor'})
            if (user_id is not None) and filter:
                    if filter not in status:
                        return jsonify({'statusCode':400,'status':'Invalid filter'})
                    else:
                        for i in audit_id:
                            if i is not None:
                                query = """SELECT audit_type_id,stretch_name,start_date,submit_date,auditor,type_of_audit,audit_plan_id,audit_id,created_by,status,auditor_stretch,auditor FROM audit_assignment 
                                WHERE audit_id = %s AND status = %s"""
                                params = (i[0],filter)
                                data = execute_query(query,params,fetch=True)
                                if data == []:
                                    return jsonify({'statusCode':404,'status':'audit_type_id data does not exist'})
                                for j in data:
                                    if j is not None:
                                        dict['audit_type'] = j[0]
                                        dict['stretch_name'] = j[1]
                                        dict['start_date'] = j[2]
                                        dict['submit_date'] = j[3]
                                        dict['auditor'] = j[4]
                                        dict['type_of_audit'] = j[5]
                                        dict['audit_plan_id'] = j[6]
                                        dict['audit_id'] = j[7]
                                        dict['assigned_by'] = j[8]
                                        dict['status'] = j[9]
                                        dict['auditor_stretch'] = j[10]
                                        dict['auditor'] = j[11]
                                        query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                                        params = (j[6],j[0],)
                                        data2 = execute_query(query1,params,fetch=True)
                                        dict['state'] = data2[0][0]
                                        dict['district_name'] = data2[0][1]
                                        dict['name_of_road'] = data2[0][2]
                                        dict['road_number'] = data2[0][3]
                                        dict['no_of_lanes'] = data2[0][4]
                                        dict['road_owning_agency'] = data2[0][5]
                                        dict['chainage_start'] = data2[0][6]
                                        dict['chainage_end'] = data2[0][7]
                                        dict['location_start'] = data2[0][8]
                                        dict['location_end'] = data2[0][9]
                                        dict['latitude_start'] = data2[0][10]
                                        dict['latitude_end'] = data2[0][11]
                                        dict['stretch_length'] = data2[0][12]
                                        dict_params.append(dict)
                                        dict = {}
                            return jsonify({'statusCode':200,'status':'Success','details':dict_params})
            else:
                for i in audit_id:
                    query = """SELECT audit_type_id,stretch_name,start_date,submit_date,auditor,type_of_audit,audit_plan_id,audit_id,created_by,status,auditor_stretch,auditor FROM audit_assignment WHERE audit_id = %s AND auditor = %s"""
                    params = (i[0],user_id,)
                    data = execute_query(query,params,fetch=True)
                    if data == []:
                        return jsonify({'statusCode':404,'status':'audit_type_id data does not exist'})
                    for j in data:
                        dict['audit_type_id'] = j[0]
                        dict['stretch_name'] = j[1]
                        dict['start_date'] = j[2]
                        dict['submit_date'] = j[3]
                        dict['auditor'] = j[4]
                        dict['type_of_audit'] = j[5]
                        dict['audit_plan_id'] = j[6]
                        dict['audit_id'] = j[7]
                        dict['assigned_by'] = j[8]
                        dict['status'] = j[9]
                        dict['auditor_stretch'] = j[10]
                        dict['auditor'] = j[11]
                        query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                        params = (j[6],j[0],)
                        data2 = execute_query(query1,params,fetch=True)
                        if data2 != []:
                            dict['state'] = data2[0][0]
                            dict['district_name'] = data2[0][1]
                            dict['name_of_road'] = data2[0][2]
                            dict['road_number'] = data2[0][3]
                            dict['no_of_lanes'] = data2[0][4]
                            dict['road_owning_agency'] = data2[0][5]
                            dict['chainage_start'] = data2[0][6]
                            dict['chainage_end'] = data2[0][7]
                            dict['location_start'] = data2[0][8]
                            dict['location_end'] = data2[0][9]
                            dict['latitude_start'] = data2[0][10]
                            dict['latitude_end'] = data2[0][11]
                            dict['stretch_length'] = data2[0][12]
                            dict_params.append(dict)
                            dict = {}
                return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'})

@app.route('/audit_accept',methods=['GET','POST'])
def audit_accept():
    try:
        audit_id = request.form.get('audit_id')
        comments = request.form.get('comments')
        file_name = request.form.get('file_name')
        action = request.form.get('action')
        total = request.files
        audit_kml = "Audit files"
        action_list = ['Accept','Decline']
        if file_name is None or file_name == "" or audit_id == "" or audit_id is None or action is None or action == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:        
            if action not in action_list:
                return jsonify({'statusCode':400,'status':'Invalid action'})
            query = """SELECT audit_id,audit_type_id FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            check = execute_query(query,params,fetch=True)
            if check == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            file_type = file_name.split('.')[1]
            org_path = parent_dir + "/" + audit_kml
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(audit_id))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            upload_path = os.path.join(user_path,str(file_name))
            file = total.get(file_name)
            path = upload_path
            file.save(path)
            connection_string = f"postgresql://{'postgres'}:{'postgres'}@{'localhost'}:{'5432'}/{'rsa'}"
            engine = create_engine(connection_string)
            kml_file_path = path
            gdf = gpd.read_file(kml_file_path, driver='KML')
            gdf["audit_id"] = audit_id
            gdf["stretch_name"] = check[0][1]
            gdf.to_postgis('geojson_audit_stretch', engine, if_exists='append', index=False)
            mini = """SELECT status FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            verify = execute_query(mini,params,fetch=True)
            if verify[0][0] != "Audit Assigned" and verify[0][0] != 'In Progress':
                status = "This audit is already {val}".format(val=verify[0][0])
                return jsonify({'statusCode':400,'status':status}) 
            if action == 'Accept':
                query = """UPDATE audit_assignment SET kml_file = %s,comments = %s,status = %s WHERE audit_id = %s"""
                params = (path,comments,'Accepted',audit_id,)
            elif action == 'Decline':
                query = """UPDATE audit_assignment SET kml_file = %s,comments = %s,status = %s WHERE audit_id = %s"""
                params = (path,comments,'Declined',audit_id,)
            execute_query(query,params)
            return jsonify({'statusCode':200,'status':'Audit details updated successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})


@app.route('/completed_sections',methods=['GET','POST'])
def completed_sections():
    try:
        audit_id = request.json.get('audit_id')
        dummy = []
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT DISTINCT qb.section, aw.section_id FROM answer_auditwise aw INNER JOIN audit_assignment aa 
        ON aa.audit_id = aw.audit_id INNER JOIN audit_type at ON at.audit_type_id = aa.audit_type_id INNER JOIN question_bank qb 
        ON qb.section_id = aw.section_id AND qb.stage = at.stage AND qb.road_type = at.road_type WHERE aw.audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'section data does not exist'})
        for i in data:
            dummy.append(i[0])
        return jsonify({'statusCode':200,'status':'Success','details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/audit_start',methods = ['GET','POST'])
def audit_start():
    try:
        audit_id = request.json.get('audit_id')
        dict = {}
        dict_params = []
        section_dict = {}
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        status = 'Audit Started'
        query = """SELECT audit_type_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        audit_type_id = execute_query(query,params,fetch=True)
        if audit_type_id == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        else:
            query2 = """SELECT questions FROM audit_type WHERE audit_type_id = %s"""
            params = (audit_type_id[0][0],)
            questions = execute_query(query2,params,fetch=True)
            if questions == []:
                return jsonify({'statusCode':404,'status':'question data does not exist'})
            if questions[0][0] is None:
                return jsonify({'statusCode':404,'status':'questions data is None'})
            json_data = questions[0][0]
            q_keys = list(json_data.keys())
            q_values = list(json_data.values())
            for i in q_keys:
                i_values = json_data[i]
                q_id = list(i_values.keys())
                for j in q_id:
                    field_type = i_values[j]
                    mini = """SELECT questions,irc_help_tool,functionality,conditions,data_type,master_table,irc_path FROM question_bank WHERE q_id = %s"""
                    params = (j,)
                    ques = execute_query(mini,params,fetch=True)
                    for k in ques:
                        if k is not None:
                            dict[j] = k[0]
                            dict['field_type'] = field_type
                            dict['irc_help_tool'] = k[1]
                            dict['functionality'] = k[2]
                            dict['conditions'] = k[3]
                            dict['data_type'] = k[4]
                            dict['master_table'] = k[5]
                            dict['irc_path'] = k[6]
                            dict_params.append(dict)
                            dict = {}
                            section_dict[i] = dict_params
                dict_params = []
            query = """UPDATE audit_assignment SET status = %s WHERE audit_id = %s"""
            params = (status,audit_id,)
            execute_query(query,params)
            return jsonify({'statusCode':200,'status':'Success','details':section_dict})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/answer',methods = ['GET','POST'])
def answer():
    try:
        audit_id = request.form.get('audit_id')
        answers = request.form.get('answers')
        auditor_id = request.form.get('auditor_id')
        section_id = request.form.get('section_id')
        submitted_on = request.form.get('submitted_on')
        retrieval_ids = request.form.get('retrieval_ids')
        chainage = request.form.get('chainage')
        obs_category = request.form.get('obs_category')
        sub_section = request.form.get('sub_section')
        roadside = request.form.get('roadside')
        gps_location = request.form.get('gps_location')
        total = request.files
        format_data = "%d-%m-%Y"
        submitted_on = datetime.strptime(submitted_on,format_data)
        file_saves = []
        section_list = []
        file_dict = {}
        org_count = 0
        issues = {}
        issue_dict = {}
        status = 'Audit Completed'
        obs_status = 'True'
        extra = []
        a = 0
        if chainage is None or chainage == "" or audit_id is None or audit_id == "" or answers is None or answers == "" or section_id is None or section_id == "" or submitted_on == "" or submitted_on is None:
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        category = ['critical observation', 'general observation','both']
        query0 = """SELECT auditor FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        auditor = execute_query(query0,params,fetch=True)
        if auditor == [] or auditor[0][0] != auditor_id:
            return jsonify({'statusCode':400,'status':'Invalid auditor_id'})
        answer = "answers"
        answers = json.loads(answers)
        if type(answers) != dict:
            return jsonify({'statusCode':400,'status':'Invalid input type for answers'})
        else:
            ans_list = list(answers.keys())
            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            sec = execute_query(mini,params,fetch=True)
            if sec == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            mini_count = """SELECT DISTINCT(section_count) FROM answer_auditwise WHERE audit_id = %s AND section_id = %s"""
            params = (audit_id,section_id,)
            sec_count = execute_query(mini_count,params,fetch=True)
            if sec_count == []: 
                org_count = 1
            else:
                for i in sec_count:
                    extra.append(i[0])
                extra.sort()
                org_count = extra[-1] + 1
            # if '+' not in chainage:
            #     return jsonify({'statusCode':400,'status':'Invalid input type for chainage'})
            # chainage_txt = chainage.split('+')
            # if len(chainage_txt) != 2:
            #     return jsonify({'statusCode':400,'status':'Invalid format for chainage, must be start+end'})
            # start_ch = int(chainage_txt[0])
            # end_ch = int(chainage_txt[1])
            # if type(start_ch) != int or type(end_ch) != int:
            #         return jsonify({'statusCode':400,'status':'Enter integer value chainage'})
            if "file_name" in ans_list:
                file_name = answers["file_name"]
                for i in file_name:
                    the_file = i
                    file = total.get(the_file)
                    # format = "webp"
                    # f_name = i.split('.')
                    # f_name = ".".join(f_name[:-1])
                    # final_name = f_name + "." + format
                    # with Image.open(file) as image:
                    #     image.convert('RGB').save(final_name)
                        
                    org_path = parent_dir + "/" + answer
                    bool1 = os.path.exists(org_path)
                    if bool1 is False:
                        os.makedirs(org_path)
                    
                    user_path = os.path.join(org_path, str(audit_id))
                    bool2 = os.path.exists(user_path)
                    if bool2 is False:
                        os.makedirs(user_path)
                    count_path = os.path.join(user_path, str(org_count))
                    bool2 = os.path.exists(count_path)
                    if bool2 is False:
                        os.makedirs(count_path)
                    path = count_path + "/" + the_file
                    file.save(path)
                    file_saves.append(path)
                    rem_ext = the_file.split('.')
                    rem_ext = rem_ext[:-1]
                    rem_ext = ".".join(rem_ext)
                    file_dict[rem_ext] = path
                answers["file_name"] = file_saves
            key = answers.keys()
            retrieval_ids = json.loads(retrieval_ids)
            if retrieval_ids is not None and retrieval_ids != "" and retrieval_ids != []: 
                retrieval_ids = tuple(retrieval_ids)
                insquery1 = """SELECT json_build_object(
                                'retrieval_id', retrieval_id,
                                'issues', array_agg(issue),
                                'suggestion_ids', array_agg(suggestion_id),
                                'suggestions', array_agg(suggestion)
                            )
                            FROM suggestion_mapping
                            WHERE retrieval_id IN %s
                            GROUP BY retrieval_id;
                            """
                params = (retrieval_ids,)
                ret_data = execute_query(insquery1,params,fetch=True)
                if ret_data != []:
                    # issues['retrieval_id'] = ret_data[0][0]
                    # issues['issue'] = ret_data[0][1]
                    # issues['suggestion_id'] = ret_data[0][2]
                    # issues['suggestion'] = ret_data[0][3]
                    issue_dict[a] = ret_data[0][0]
                    # issues = {}
                    # a+=1
                retrieval_ids = list(retrieval_ids)
            for i in key:
                if i != "filename" and i != "file_name":
                    if retrieval_ids is not None and retrieval_ids != "":
                        queryins = """INSERT INTO answer_auditwise (audit_id,section_id,section_count,submitted_on,retrieval_ids,chainage,roadside,gps_location,issues,q_id,answer) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                        params = (audit_id,section_id,org_count,submitted_on,retrieval_ids,chainage,roadside,gps_location,json.dumps(issue_dict),i,answers[i])
                        execute_query(queryins,params)
                    else:
                        queryins = """INSERT INTO answer_auditwise (audit_id,section_id,section_count,submitted_on,chainage,roadside,gps_location,q_id,answer) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
                        params = (audit_id,section_id,org_count,submitted_on,chainage,roadside,gps_location,i,answers[i],)
                        execute_query(queryins,params)
            if obs_category is not None and obs_category != "":
                obs = obs_category.lower() 
                if obs not in category:
                    return jsonify({'statusCode':400,'status':'Invalid obs_category'})
                if obs == 'critical observation':
                    insquery2 = """UPDATE answer_auditwise SET critical_obs = %s WHERE audit_id = %s AND section_count = %s"""
                    params = (obs_status,audit_id,org_count,)
                    execute_query(insquery2,params)
                elif obs == 'general observation':
                    insquery2 = """UPDATE answer_auditwise SET general_obs = %s WHERE audit_id = %s AND section_count = %s"""
                    params = (obs_status,audit_id,org_count,)
                    execute_query(insquery2,params)
                elif obs == 'both':
                    insquery2 = """UPDATE answer_auditwise SET general_obs = %s,critical_obs = %s WHERE audit_id = %s AND section_count = %s"""
                    params = (obs_status,obs_status,audit_id,org_count,)
                    execute_query(insquery2,params)
                if sec[0][0] == 'End Audit Details':
                    query2 = """UPDATE audit_assignment SET status = %s WHERE audit_id = %s"""
                    params = (status,audit_id,)
                    execute_query(query2,params)
            if sec[0][0] == 'End Audit Details':
                query2 = """UPDATE audit_assignment SET status = %s WHERE audit_id = %s"""
                params = (status,audit_id,)
                execute_query(query2,params)
            if sub_section is not None and sub_section != "":
                sub_section = json.loads(sub_section)
                if type(sub_section) != dict:
                    return jsonify({'statusCode':400,'status':'Invalid input type for sub_section'})
                insquery3 = """UPDATE answer_auditwise SET sub_section = %s WHERE audit_id = %s AND section_count = %s"""
                params = (json.dumps(sub_section),audit_id,org_count)
                execute_query(insquery3,params)
            for i in file_dict:
                query_upd = """UPDATE answer_auditwise SET image_path = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s AND q_id = %s"""
                params = (file_dict[i],audit_id,section_id,org_count,i,)
                execute_query(query_upd,params)
        return jsonify({'statusCode':200,'status':'Successfully stored audit answers'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/ae_approval',methods=['GET','POST'])
def ae_approval():
    try:
        userid = request.json.get('userid')
        audit_id = request.json.get('audit_id')
        approval = request.json.get('approval')
        section_id = request.json.get('section_id')
        sec_count = request.json.get('sec_count')
        comments = request.json.get('comments')
        validation = ["userid","audit_id","approval","section_id","sec_count","comments"]
        status = ["approve","reject"]
        check = json_validate(validation)
        if check != {}:
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statuscode":400,"status":status})    
        query = """SELECT user_id FROM users WHERE user_id = %s AND role = %s"""
        params = (userid,'AE',)
        ae_chck = execute_query(query,params,fetch=True)
        if ae_chck == []:
            return jsonify({'statusCode':400,'status':'Invalid ae_userid'})
        
        audit_chk = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        idchk = execute_query(audit_chk,params,fetch=True)
        if idchk == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        audit_chk2 = """SELECT audit_id FROM answer_auditwise WHERE audit_id = %s"""
        params = (audit_id,)
        idchk = execute_query(audit_chk2,params,fetch=True)
        if idchk == []:
            return jsonify({'statusCode':400,'status':'Audit report not submitted'})
        sec_chck = """SELECT audit_id FROM answer_auditwise WHERE audit_id = %s AND section_id = %s"""
        params = (audit_id,section_id,)
        sec_ver = execute_query(sec_chck,params,fetch=True)
        if sec_ver == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        approval = approval.lower()
        if approval not in status:
            return jsonify({'statusCode':400,'status':'Invalid approval action'})
        sec_id = """SELECT audit_id FROM answer_auditwise WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
        params = (audit_id,section_id,sec_count,)
        count_chk = execute_query(sec_id,params,fetch=True)
        if count_chk == []:
            return jsonify({'statusCode':400,'status':'Invalid sec_count'})
        query = """UPDATE answer_auditwise SET ae_approval = %s,ae_comments = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
        params = (approval,comments,audit_id,section_id,sec_count,)
        execute_query(query,params)
        return jsonify({'statusCode':200,'status':'Updated AE comments successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})

@app.route('/answer_edit',methods=['GET','POST'])
def answer_edit():
    try:
        audit_id = request.form.get('audit_id')
        answers = request.form.get('answers')
        answers = json.loads(answers)
        updated_by = request.form.get('updated_by')
        updated_on = request.form.get('updated_on')
        number = request.form.get('number')
        section_id = request.form.get('section_id')
        delete_status = request.form.get('delete_status')
        chainage = request.form.get('chainage')
        obs_category = request.form.get('obs_category')
        sub_section = request.form.get('sub_section')
        roadside = request.form.get('roadside')
        gps_location = request.form.get('gps_location')
        new_issue = request.form.get('new_issue')
        new_suggestion = request.form.get('new_suggestion')
        #ADDED INCASE IF ASKED .NEED TO ADD THE BELOW TWO PAYLOADS IN INSERT QUERY
        image_lat = request.form.get('image_lat')   
        image_long = request.form.get('image_long')
        format_data = "%d-%m-%Y"
        updated_on = datetime.strptime(updated_on, format_data)
        total = request.files
        answer = "answers"
        obs_status = 'True'
        default_status = None
        file_saves = []
        if gps_location is None or gps_location == "" or chainage is None or chainage == "" or delete_status is None or delete_status == "" or section_id == "" or section_id is None or number is None or number == "" or audit_id is None or audit_id == "" or answers is None or answers == "" or updated_by == "" or updated_by is None or updated_on == "" or updated_on is None:
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:
            category = ['critical observation', 'general observation','both']
            audit_chk = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            idchk = execute_query(audit_chk,params,fetch=True)
            if idchk == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            if (new_issue is not None and new_issue != "") or (new_suggestion is not None and new_suggestion != ""): 
                new_issue = json.loads(new_issue)
                new_suggestion = json.loads(new_suggestion)
                if type(new_issue) != list or type(new_suggestion) != list:
                    return jsonify({'statusCode':400,'status':'Invalid input type for new_issue or new_suggestion'})
            chck = """SELECT user_id FROM users WHERE user_id = %s"""
            params = (updated_by,)
            verify = execute_query(chck,params,fetch=True)
            if verify == []:
                return jsonify({'statusCode':400,'status':'Invalid user_id in updated_by'})
            query0 = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            params = (section_id,)
            section = execute_query(query0,params,fetch=True)
            if section == []:
                return jsonify({'statusCode':400,'status':'Invalid section_id'})
            val = """SELECT DISTINCT(section_id) FROM answer_auditwise WHERE section_id = %s"""
            params = (section_id,)
            valcheck = execute_query(val,params,fetch=True)
            if valcheck == []:
                return jsonify({'statusCode':105,'status':'Section not included in this audit'})
            else:
                check_status = """SELECT critical_obs,general_obs FROM answer_auditwise WHERE audit_id = %s AND section_count = %s"""
                params = (audit_id,number,)
                data = execute_query(check_status,params,fetch=True)
                critical = data[0][0]
                general = data[0][1]
                # query = """SELECT answers FROM answers WHERE audit_id = %s AND section = %s AND section_count = %s"""
                # params = (audit_id,section[0][0],number,)
                # ans = execute_query(query,params,fetch=True)
                # if ans ==[]:
                    # return jsonify({'statusCode':404,'status':'Data does not exist'})
                count_fet = """SELECT updated_count FROM answer_auditwise WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
                params = (audit_id,section_id,number,)
                count = execute_query(count_fet,params,fetch=True)
                if count[0][0] is None:
                    org_count = 1
                else:
                    org_count = count[0][0] + 1
                # if '+' not in chainage:
                #     return jsonify({'statusCode':400,'status':'Invalid input type for chainage'})
                # chainage_txt = chainage.split('+')
                # start_ch = int(chainage_txt[0])
                # end_ch = int(chainage_txt[1])
                # if type(start_ch) != int or type(end_ch) != int:
                #         return jsonify({'statusCode':400,'status':'Enter integer value chainage'})
                ans_keys = list(answers.keys())
                if "file_name" in ans_keys:
                    file_name = answers["file_name"]
                    # actual_path = the_ans["file_name"]
                    for i in file_name:
                        the_file = i
                        file = total.get(the_file)
                        # format = "webp"
                        # f_name = i.split('.')
                        # f_name = ".".join(f_name[:-1])
                        # final_name = f_name + "." + format
                        # with Image.open(file) as image:
                        #     image.convert('RGB')
                            
                        org_path = parent_dir + "/" + answer
                        bool1 = os.path.exists(org_path)
                        if bool1 is False:
                            os.makedirs(org_path)
                        
                        user_path = os.path.join(org_path, str(audit_id))
                        bool2 = os.path.exists(user_path)
                        if bool2 is False:
                            os.makedirs(user_path)

                        final_path = os.path.join(user_path,str(number))
                        bool3 = os.path.exists(final_path)
                        if bool3 is False:
                            os.makedirs(final_path)
                        # file = total.get(the_file)
                        path = final_path+"/"+the_file
                        file.save(path)
                        file_saves.append(path)
                    # for d in file_saves:
                    #     if d in actual_path:
                    #         answers["file_name"] = file_saves
                    #     else:
                    #         return jsonify({'statusCode':106,'status':'upload path and actual path are not equal'})
                key = answers.keys()
                for i in key:
                    if i != "filename" and i != "file_name":
                        mini = """UPDATE answer_auditwise SET answer = %s,last_updated_by = %s,updated_count= %s,delete_status = %s,
                        chainage = %s,gps_location = %s,roadside = %s,new_issue = %s,new_suggestion = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s AND q_id = %s"""
                        params = (answers[i],updated_by,org_count,delete_status,chainage,gps_location,roadside,new_issue,new_suggestion,audit_id,section_id,number,i,)
                        execute_query(mini,params)
                if obs_category is not None and obs_category != "":
                    obs = obs_category.lower() 
                    if obs == 'critical observation':
                        if general == True:
                            miniupd = """UPDATE answer_auditwise SET general_obs = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
                            params = (default_status,audit_id,section_id,number,)
                            execute_query(miniupd,params)
                        mini = """UPDATE answer_auditwise SET last_updated_by = %s,updated_count= %s,delete_status = %s,chainage = %s,critical_obs = %s,gps_location = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
                        params = (updated_by,org_count,delete_status,chainage,obs_status,gps_location,audit_id,section_id,number,)
                        execute_query(mini,params)
                    elif obs == 'general observation':
                        if critical == True:
                            miniupd = """UPDATE answer_auditwise SET critical_obs = %s WHERE audit_id = %s AND section_id= %s AND section_count = %s"""
                            params = (default_status,audit_id,section_id,number,)
                            execute_query(miniupd,params)
                        mini = """UPDATE answer_auditwise SET last_updated_by = %s,updated_count= %s,delete_status = %s,chainage = %s,general_obs = %s,gps_location = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
                        params = (updated_by,org_count,delete_status,chainage,obs_status,gps_location,audit_id,section_id,number,)
                        execute_query(mini,params)
                    elif obs == 'both':
                        miniupd = """UPDATE answer_auditwise SET critical_obs = %s,general_obs = %s WHERE audit_id = %s AND section_id = %s"""
                        params = (obs_status,obs_status,audit_id,section_id,)
                        execute_query(miniupd,params)
                        mini = """UPDATE answer_auditwise SET last_updated_by = %s,updated_count= %s,delete_status = %s,chainage = %s,general_obs = %s,gps_location = %s WHERE audit_id = %s AND section_id = %s AND section_count = %s"""
                        params = (updated_by,org_count,delete_status,chainage,obs_status,gps_location,audit_id,section_id,number,)
                        execute_query(mini,params)
        return jsonify({'statusCode':200,'status':'Successfully updated audit answers'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/general_audit_details',methods=['GET','POST'])
def general_audit_details():
    try:
        audit_id = request.json.get('audit_id')
        dict_params = []
        dummy =  {}
        sec_dict = {}
        details = ['Start Audit Details','End Audit Details']
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT answer_auditwise.q_id,answer_auditwise.answer,question_bank.questions,question_bank.section FROM answer_auditwise
        JOIN question_bank ON question_bank.q_id = answer_auditwise.q_id WHERE answer_auditwise.audit_id = %s AND answer_auditwise.section_id IN %s"""
        params = (audit_id,('A','B'))
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'General audit details data does not exist'})
        for i in data:
            dummy['q_id'] = i[0]
            dummy['question'] = i[2]
            dummy['answer'] = i[1]
            dict_params.append(dummy)
            if i[3] not in sec_dict:
                sec_dict[i[3]] = []
            sec_dict[i[3]].append(dummy)
            dummy = {}
            dict_params = []
        return jsonify({'statusCode':200,'status':"Success","details":sec_dict})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
@app.route('/audit_section_detail',methods=['GET','POST'])
def audit_section_details():
    try:
        audit_id = request.json.get('audit_id')
        dummy = {}
        the_data = ""
        store = {}
        audit_id = request.json.get('audit_id')
        query = """SELECT answer_auditwise.section_id,question_bank.section,answer_auditwise.section_count,answer_auditwise.q_id,answer_auditwise.answer,answer_auditwise.issues,
                question_bank.conditions,question_bank.field_type,question_bank.functionality,question_bank.irc_help_tool,question_bank.master_table,question_bank.questions,
                answer_auditwise.issues,question_bank.data_type,answer_auditwise.general_obs,answer_auditwise.critical_obs,answer_auditwise.roadside,answer_auditwise.new_issue
                ,answer_auditwise.new_suggestion,answer_auditwise.ae_approval,answer_auditwise.ae_comments FROM answer_auditwise INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id
                where answer_auditwise.audit_id = %s AND answer_auditwise.section_id NOT IN %s"""
        params = (audit_id,('A','B'),)
        data = execute_query(query,params,fetch=True)
        for i in data:
            section = i[1]
            section_count = i[2]
            dummy['answer'] = i[4]
            dummy['roadside'] = i[16]
            dummy['conditions'] = i[6]
            dummy['data_type'] = i[13]
            dummy['field_type'] = i[7]
            dummy['functionality'] = i[8]
            dummy['irc_help_tool'] = i[9]
            dummy['master_table'] = i[10]
            dummy['question'] = i[11]
            dummy['question_id'] = i[3]
            dummy['retrieval_id'] = list(dict(i[12]).values()) if i[12] is not None else []
            dummy['section'] = i[1]
            dummy['section_count'] = i[2]
            dummy['section_id'] = i[0]
            dummy['general_observation'] = i[14]
            dummy['critical_observation'] = i[15]
            dummy['new_issue'] = i[17]
            dummy['new_suggestion'] = i[18]
            dummy['ae_approval'] = i[19]
            dummy['ae_comments'] = i[20]
            if section not in store:
                store[section] = {}
            if section_count not in store[section]:
                store[section][section_count] = []
            store[section][section_count].append(dummy)
            dummy = {}
        q_get = """SELECT hfaz FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)    
        hfaz = execute_query(q_get,params,fetch=True)
        if hfaz != []:
            the_data = hfaz[0][0]
        else:
            the_data = hfaz
        return jsonify({'statusCode':200,'status':"Success",'details':store,'hfaz':the_data})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

# @app.route('/audit_section_detail_first',methods=['GET','POST'])
# def audit_section_detail():
#     try:
#         audit_id = request.json.get('audit_id')
#         dict_params = []
#         first_dict = {}
#         dict =  {}
#         mini_dict = {}
#         mini_params = []
#         second_dict = {}
#         sec_count = []
#         all_sec = []
#         dummy = []
#         if audit_id is None or audit_id == "":
#             return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
#         check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
#         params = (audit_id,)
#         verify = execute_query(check,params,fetch=True)
#         if verify == []:
#             return jsonify({'statusCode':400,'status':'Invalid audit_id'})
#         query = """SELECT section,section_count FROM answers WHERE audit_id = %s"""
#         params = (audit_id,)
#         json_data = execute_query(query,params,fetch=True)
#         print(json_data,'as')
#         if json_data == []:
#             return jsonify({'statusCode':404,'status':'section data does not exist'})
#         else:
#             for i in json_data:
#                 if i[0] != "Start Audit Details" and i[0] != "End Audit Details":
#                     all_sec.append(i[0])
#                     sec_count.append(i[1])
#             all_sec = set(all_sec)
#             all_sec = list(all_sec)
#             sec_count = set(sec_count)
#             sec_count = list(sec_count)
#             for i in all_sec:
#                     for x in sec_count:
#                         query1 =  """SELECT DISTINCT(question_bank.section_id),answers.answers,answers.section_count,answers.section,answers.retrieval_ids,answers.new_issue,answers.new_suggestion FROM answers LEFT JOIN question_bank ON answers.section = question_bank.section WHERE audit_id = %s AND answers.section = %s AND answers.section_count = %s"""
#                         params = (audit_id,i,x,)
#                         data = execute_query(query1,params,fetch=True)
#                         for a in data:
#                             if a is not None:
#                                 if i == a[3]:
#                                     ans = a[1]
#                                     ans_keys = list(ans.keys())
#                                     for b in ans_keys:
#                                         if b != "file_name":
#                                             query2 = """SELECT questions,conditions,data_type,field_type,functionality,irc_help_tool,master_table FROM question_bank WHERE q_id = %s"""
#                                             params = (b,)
#                                             ques = execute_query(query2,params,fetch=True)
#                                             print(ques,'ques')
#                                             if ques == []:
#                                                 return jsonify({'statusCode':404,'status':'question_bank data does not exist'})
#                                             for c in ques:

#                                                 if c is not None:
#                                                     dict["question"] = c[0]
#                                                     dict['conditions'] = c[1]
#                                                     dict['data_type'] = c[2]
#                                                     dict['field_type'] = c[3]
#                                                     dict['functionality'] = c[4]
#                                                     dict['irc_help_tool'] = c[5]
#                                                     dict['master_table'] = c[6]
#                                                     dict["question_id"] =b 
#                                                     dict["answer"] = ans[b]
#                                                     dict["section_count"] = a[2]
#                                                     dict['section'] = a[3]
#                                                     dict['section_id'] = a[0]
#                                                 if a[4] is not None or a[4] != "":
#                                                     for d in a[4]:
#                                                         mini = """SELECT issue,suggestion_id,suggestion FROM suggestion_mapping WHERE retrieval_id = %s"""
#                                                         params = (d,)
#                                                         suggestion = execute_query(mini,params,fetch=True)
#                                                         print('sugges',suggestion)
#                                                         if suggestion != []:
#                                                             for e in suggestion:
#                                                                 if e is not None:
#                                                                     mini_dict['retrieval_id'] = d
#                                                                     mini_dict['issue'] = e[0]
#                                                                     mini_dict['suggestion_id'] = e[1]
#                                                                     mini_dict['suggestion'] = e[2]
#                                                                     mini_params.append(mini_dict)
#                                                                     mini_dict = {}
#                                                     dict['retrieval_id'] = mini_params 
#                                                     if a[5] is not None or a[5] != "" or a[6] is not None or a[6] != "":
#                                                         dict['new_issue'] = a[5]
#                                                         dict['new_suggestion'] = a[6]
#                                                     mini_params = []  
#                                         if i == a[3] and a[2] == x:
#                                             dict_params.append(dict)
#                                             dict = {}    
#                                         first_dict[x] = dict_params
#                         dict_params = []
#                     second_dict[i] = first_dict
#                     first_dict = {}
#             q_get = """SELECT hfaz FROM audit_assignment WHERE audit_id = %s"""
#             params = (audit_id,)    
#             hfaz = execute_query(q_get,params,fetch=True)
#             if hfaz != []:
#                 the_data = hfaz[0][0]
#             else:
#                 the_data = hfaz
#             return jsonify({'statusCode':200,'status':"Success",'details':second_dict,"hfaz":the_data})
#     except Exception as e:
#         return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
    

@app.route('/reassign_details',methods= ['GET','POST'])
def reassign_details():
    try:
        dict = {}
        dict_params = []
        dummy = []
        query = """SELECT audit_type_id,stretch_name FROM audit_type"""
        params = ()
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':404,'status':'audit_type_id data does not exist'})
        for i in id:
            mini = """SELECT audit_id FROM audit_assignment WHERE audit_type_id = %s"""
            params = (i[0],)
            audit_id = execute_query(mini,params,fetch=True)
            for j in audit_id:
                if j is None:
                    return jsonify({'statusCode':404,'status':'audit_id data does not exist'})
                else:
                    dummy.append(j[0])
            dict["audit_id"] = dummy
            dict['audit_type_id'] = i[0]
            dict['stretch_name'] = i[1]
            dict_params.append(dict)
            dict = {}
            dummy = []
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'})
    

@app.route('/hfaz_enable',methods=['GET','POST'])
def hfaz_enable():
    try:
        audit_id = request.json.get('audit_id')
        q_check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(q_check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        q_upd = """UPDATE audit_assignment SET hfaz = %s WHERE audit_id = %s"""
        params = ('True',audit_id,)
        execute_query(q_upd,params)
        return jsonify({'statusCode':200,'status':'HFAZ enabled Successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/check_hfaz',methods=['GET','POST'])
def check_hfaz():
    try:
        audit_id = request.json.get('audit_id')
        status = ""
        q_check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(q_check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT hfaz FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            status = False
        if data[0][0] == 'False' or data[0][0] is None:
            status = False
        else:
            status = True
        return jsonify({'statusCode':200,'status':'Success','hfaz':status})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/hfaz_id',methods=['GET','POST'])
def hfaz_id():
    try:
        id = ''.join(random.choices(string.digits,k=4))
        hfaz = 'HFAZ'
        hfaz_id = f"{hfaz}{id}"
        return jsonify({'statusCode':200,'status':'Success','details':hfaz_id})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'})
    
@app.route('/hfaz_creation',methods= ['GET','POST'])
def hfaz_creation():
    try:
        hfaz_id = request.json.get('hfaz_id')
        start_gps = request.json.get('start_gps')
        end_gps = request.json.get('end_gps')
        start_chainage = request.json.get('start_chainage')
        end_chainage = request.json.get('end_chainage')
        land_mark = request.json.get('land_mark')
        hfaz_section = request.json.get('hfaz_section')
        stretch_type = request.json.get('stretch_type')
        audit_id = request.json.get('audit_id')
        if start_gps is None or start_gps == "" or end_gps is None or end_gps == "" or hfaz_id is None or hfaz_id == "" or start_chainage == "" or start_chainage is None or end_chainage == "" or end_chainage is None or land_mark is None or land_mark == "" or hfaz_section == "" or hfaz_section is None or stretch_type == "" or stretch_type is None or audit_id is None or audit_id == "": 
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:
            a_check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            audit_ver = execute_query(a_check,params,fetch=True)
            if audit_ver == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            query = """SELECT section_id,section_count FROM answer_auditwise WHERE chainage >= %s AND chainage <= %s AND audit_id = %s"""
            params = (start_chainage,end_chainage,audit_id,)
            chainage = execute_query(query,params,fetch=True)
            if chainage == []:
                return jsonify({'statusCode':500,'status':'section_id data does not exist'})
            query = """INSERT INTO hfaz (hfaz_id,audit_id,start_chainage,end_chainage,landmark,hfaz_section,stretch_type,start_gps,end_gps) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            params = (hfaz_id,audit_id,start_chainage,end_chainage,land_mark,hfaz_section,stretch_type,start_gps,end_gps)
            execute_query(query,params)
            query1 = """UPDATE answer_auditwise SET hfaz_id = %s WHERE audit_id = %s AND chainage >= %s AND chainage <= %s"""
            params = (hfaz_id,audit_id,start_chainage,end_chainage,)
            execute_query(query1,params)
            return jsonify({'statusCode':200,'status':'Success','details':hfaz_id})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
@app.route('/hfaz_list',methods =['GET','POST'])
def hfaz_list():
    try:
        audit_id = request.json.get('audit_id')
        # hfaz_id = request.json.get('hfaz_id')
        dict = {}
        dict_params = []
        if audit_id is None or audit_id == "":
            query = """SELECT hfaz_id,audit_id,start_chainage,end_chainage,landmark,hfaz_section,stretch_type,start_gps,end_gps FROM hfaz """
            params = ()
            data = execute_query(query,params,fetch=True)   
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid hfaz_id'})
            else:
                for i in data:
                    dict["hfaz_id"] = i[0]
                    dict['audit_id'] = i[1]
                    dict['start_chainage'] = i[2]
                    dict['end_chainage'] = i[3]
                    dict['landmark'] = i[4]
                    dict['hfaz_section'] = i[5]
                    dict['stretch_type'] = i[6]
                    dict['start_gps'] = i[7]
                    dict['end_gps'] = i[8]
                    dict_params.append(dict)
                    dict = {}
        else:
            query = """SELECT hfaz_id,audit_id,start_chainage,end_chainage,landmark,hfaz_section,stretch_type,start_gps,end_gps FROM hfaz WHERE audit_id = %s"""
            params = (audit_id,)
            data = execute_query(query,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':400,'status':'Invalid hfaz_id'})
            else:
                for i in data:
                    dict["hfaz_id"] = i[0]
                    dict['audit_id'] = i[1]
                    dict['start_chainage'] = i[2]
                    dict['end_chainage'] = i[3]
                    dict['landmark'] = i[4]
                    dict['hfaz_section'] = i[5]
                    dict['stretch_type'] = i[6]
                    dict['start_gps'] = i[7]
                    dict['end_gps'] = i[8]
                    dict_params.append(dict)
                    dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/hfaz_report',methods=['GET','POST'])
def hfaz_report():
    try:
        audit_id = request.json.get('audit_id')
        dict = {}
        dict_params = []
        query = """SELECT hfaz_id,audit_id,start_chainage,end_chainage,landmark,hfaz_section,stretch_type FROM hfaz WHERE audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            dict_params = []
        else:
            for i in data:
                dict["hfaz_id"] = i[0]
                dict['audit_id'] = i[1]
                dict['start_chainage'] = i[2]
                dict['end_chainage'] = i[3]
                dict['landmark'] = i[4]
                dict['hfaz_section'] = i[5]
                dict['stretch_type'] = i[6]
                dict_params.append(dict)
                dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/hfaz_report_merged',methods=['GET','POST'])
def hfaz_report_merged():
    try:
        audit_type_id = request.json.get('audit_type_id')
        dict = {}
        dict_params = []
        if audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete Details','message':'Please fill all the details'})
        check ="""SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query0 = """SELECT audit_id FROM audit_assignment WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        audit_id = execute_query(query0,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':500,'status':'audit_id data does not exist'})
        for i in audit_id: 
            query = """SELECT hfaz_id,audit_id,start_chainage,end_chainage,landmark,hfaz_section,stretch_type,start_gps,end_gps FROM hfaz WHERE audit_id = %s"""
            params = (i[0],)
            data = execute_query(query,params,fetch=True)
            if data != []:
                for j in data:
                    dict["hfaz_id"] = j[0]
                    dict['audit_id'] = j[1]
                    dict['start_chainage'] = j[2]
                    dict['end_chainage'] = j[3]
                    dict['landmark'] = j[4]
                    dict['hfaz_section'] = j[5]
                    dict['stretch_type'] = j[6]
                    dict['start_gps'] = j[7]
                    dict['end_gps'] = j[8]
                    dict_params.append(dict)
                    dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})


@app.route('/hfaz_view',methods=['GET','POST'])
def hfaz_view():
    try:
        hfaz_id = request.json.get('hfaz_id')
        dict =  {}
        store = {}
        dummy = {}
        if hfaz_id is None or hfaz_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})   
        query = """SELECT hfaz_id,start_chainage,end_chainage,audit_id FROM hfaz WHERE hfaz_id = %s"""
        params = (hfaz_id,)
        check = execute_query(query,params,fetch=True)
        if check == []:        
            return jsonify({'statusCode':400,'status':'Invalid hfaz_id'})
        else:
            start_chainage = check[0][1]
            end_chainage = check[0][2]
            audit_id = check[0][3]
            query = """SELECT answer_auditwise.section_id,question_bank.section,answer_auditwise.section_count,answer_auditwise.q_id,answer_auditwise.answer,answer_auditwise.issues,
                question_bank.conditions,question_bank.field_type,question_bank.functionality,question_bank.irc_help_tool,question_bank.master_table,question_bank.questions,
                answer_auditwise.issues,question_bank.data_type,answer_auditwise.audit_id FROM answer_auditwise INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id
                WHERE audit_id = %s AND chainage >= %s AND chainage <= %s AND answer_auditwise.section_id NOT IN %s"""
            params = (audit_id,start_chainage,end_chainage,('A','B'))
            data = execute_query(query,params,fetch=True)
            for i in data:
                section = i[1]
                section_count = i[2]
                dummy['answer'] = i[4]
                dummy['conditions'] = i[6]
                dummy['data_type'] = i[13]
                dummy['field_type'] = i[7]
                dummy['functionality'] = i[8]
                dummy['irc_help_tool'] = i[9]
                dummy['master_table'] = i[10]
                dummy['question'] = i[11]
                dummy['question_id'] = i[3]
                dummy['retrieval_id'] = list(i[12].values()) if i[12] is not None else []
                dummy['section'] = i[1]
                dummy['section_id'] = i[0]
                dummy['section_count'] = section_count
                dummy['audit_id'] = i[14]
                if section not in store:
                    store[section] = {}
                if section_count not in store[section]:
                    store[section][section_count] = []
                store[section][section_count].append(dummy)
                dummy = {}
            return jsonify({'statusCode':200,'status':"Success",'details':store})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
        
@app.route('/hfaz_edit',methods= ['GET','POST'])
def hfaz_edit():
    try:
        hfaz_id = request.json.get('hfaz_id')
        start_chainage = request.json.get('start_chainage')
        end_chainage = request.json.get('end_chainage')
        # land_mark = request.json.get('land_mark')
        # section_id = request.json.get('section_id')
        # stretch_type = request.json.get('stretch_type')
        # audit_id = request.json.get('audit_id')
        all_sec = []
        if hfaz_id is None or hfaz_id == "" or start_chainage == "" or start_chainage is None or end_chainage == "" or end_chainage is None: 
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:
            hfaz = """SELECT hfaz_id FROM hfaz WHERE hfaz_id = %s"""
            params = (hfaz_id,)
            hfaz_check = execute_query(hfaz,params,fetch=True)
            if hfaz_check == []:
                return jsonify({'statusCode':400,'status':'Invalid hfaz_id'})
            else:
                # sec = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
                # params = (section_id,)
                # section = execute_query(sec,params,fetch=True)
                # if section == []:
                #     return jsonify({'statusCode':400,'status':'Invalid section_id'})
                # else:
                #     fetch_sec = """SELECT section FROM answers WHERE audit_id = %s"""
                #     params = (audit_id,)
                #     the_sec = execute_query(fetch_sec,params,fetch=True)
                #     for i in the_sec:
                #         all_sec.append(i[0])
                #     if section[0][0] not in all_sec:
                #         return jsonify({'statusCode':105,'status':'This section is not included in this audit'})
                #     else:
                query = """UPDATE hfaz SET start_chainage = %s,end_chainage = %s WHERE hfaz_id = %s"""
                params = (start_chainage,end_chainage,hfaz_id,)
                execute_query(query,params)
                return jsonify({'statusCode':200,'status':'Success','details':hfaz_id})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'})
    
    
#report
@app.route('/report',methods = ['GET','POST'])
def report():
    try:
        audit_id = request.json.get('audit_id')
        auditor_id = request.json.get('auditor_id')
        #rsa_data = request.form.get('rsa_data')
        background = request.json.get('background')
        hfaz_data = request.json.get('hfaz_data')
        # file_name = request.form.get('file_name')
        # total = request.files
        status = 'Report Submitted'
        # rsa_data = json.loads(rsa_data)
        # background = json.loads(background)
        # hfaz_data = json.loads(hfaz_data)
        report = 'Report'
        if background is None or background == "" or hfaz_data is None or hfaz_data == "" or audit_id is None or audit_id == "" or auditor_id is None or auditor_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        query0 = """SELECT audit_id,stretch_name FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query0,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        acheck = """SELECT audit_id FROM report WHERE audit_id = %s"""
        params = (audit_id,)
        averify = execute_query(acheck,params,fetch=True)
        check = """SELECT auditor FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify[0][0] != auditor_id:
            return jsonify({'statusCode':400,'status':'Invalid auditor_id'})
        query = """SELECT created_by FROM users WHERE user_id = %s"""
        params = (auditor_id,)
        lead_auditor = execute_query(query,params,fetch=True)
        if type(hfaz_data) != list:
            return jsonify({'statusCode':400,'status':'Invalid input type used in hfaz_data'})
        if hfaz_data != []:
            for i in hfaz_data:
                hfaz_chck = """SELECT hfaz_id FROM hfaz WHERE hfaz_id = %s"""
                params = (i,)
                hfaz_id = execute_query(hfaz_chck,params,fetch=True)
                if hfaz_id == []:
                    return jsonify({'statusCode':400,'status':'Invalid hfaz_id used in hfaz_data'})
            # org_path = parent_dir + "/" + report
            # bool1 = os.path.exists(org_path)
            # if bool1 is False:
            #     os.makedirs(org_path)
            # user_path = os.path.join(org_path,str(data[0][1]))
            # bool2 = os.path.exists(user_path)
            # if bool2 is False:
            #     os.makedirs(user_path)
            # audit_path = os.path.join(user_path,str(audit_id))
            # bool2 = os.path.exists(audit_path)
            # if bool2 is False:
            #     os.makedirs(audit_path)   
            # file = total.get(file_name)
            # path = audit_path+"/"+file_name
            # file.save(path)
        if averify == []:
            query = """INSERT INTO report (audit_id,auditor,checked_by,background_details,hfaz_data,status) VALUES (%s,%s,%s,%s,%s,%s)"""
            params = (audit_id,auditor_id,lead_auditor[0][0],json.dumps(background),hfaz_data,status)
            execute_query(query,params)
        else:
            query = """UPDATE report SET audit_id = %s,auditor = %s,checked_by = %s,background_details = %s,hfaz_data = %s,status = %s WHERE audit_id = %s"""
            params = (audit_id,auditor_id,lead_auditor[0][0],json.dumps(background),hfaz_data,status,audit_id,)
            execute_query(query,params)
        return jsonify({'statusCode':200,'status':'Report Submitted successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    

@app.route('/report_rsa_data',methods=['GET','POST'])
def report_rsa_data():
    try:
        audit_id = request.json.get('audit_id')
        dict_params = []
        dict =  {}
        sec_dict = {}
        sec_det = {}
        det_params = []
        other_details = {}
        other_params = []
        plan_details = {}
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        query = """SELECT auditor,rsa_data,checked_by,background_details FROM report WHERE audit_id = %s"""
        params = (audit_id,)
        json_data = execute_query(query,params,fetch=True)
        if json_data == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        else:
            get_q = """SELECT audit_plan_id FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            plan_id = execute_query(get_q,params,fetch=True)
            if plan_id == []:
                return jsonify({'statusCode':500,'status':'audit_plan_id data does not exist'})
            plan_q = """SELECT audit_type_id,stretch_name,state,district,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,
            location_start,location_end,latitude_start,latitude_end,stretch_length,audit_plan_id FROM audit_plan WHERE audit_plan_id = %s"""
            params = (plan_id[0][0],)
            plan_data = execute_query(plan_q,params,fetch=True)
            if plan_data == []:
                plan_dict_params = []
            for i in plan_data:
                if i is not None:
                    plan_dict = { 
                                "audit_type_id":i[0],
                                "stretch_name":i[1],
                                "state":i[2],
                                "district":i[3],
                                "name_of_road":i[4],
                                "road_number":i[5],
                                "no_of_lanes":i[6],
                                "road_owning_agency":i[7],
                                "chainage_start":i[8],
                                "chainage_end":i[9],
                                "location_start":i[10],
                                "location_end":i[11],
                                "latitude_start":i[12],
                                "latitude_end":i[13],
                                "stretch_length":i[14],
                                "audit_plan_id":i[15]
                            }
            for i in json_data:
                if i is not None:
            #         key_list = list(i[1].keys())
                    other_details["background"] = i[3]
                    # other_details["submitted_to"] = i[5]
                    other_params.append(other_details)
                    other_details = {}
            #         for j in key_list:
            #             if j != "file_name":
            #                 sec_fetch = """SELECT DISTINCT(section) FROM question_bank WHERE section_id = %s"""
            #                 params = (j,)
            #                 section = execute_query(sec_fetch,params,fetch=True)
            #                 dummy_sec = ['Start Audit Details','End Audit Details']
            #                 if section[0][0] not in dummy_sec or section[0][0] not in dummy_sec:
            #                     the_dict = (i[1])[j]
            #                     qid = list(the_dict.keys())
            #                     for k in qid:
            #                         mini = """SELECT questions FROM question_bank WHERE q_id = %s"""
            #                         params = (k,)
            #                         questions = execute_query(mini,params,fetch=True)
            #                         dict['q_id'] = k
            #                         dict['question'] = questions[0][0]
            #                         dict['answer'] = the_dict[k]
            #                         dict_params.append(dict)
            #                         dict = {}
            #                         sec_dict[section[0][0]] = dict_params
            #                     dict = {}
            #                     dict_params = []
            sec_fetch = """SELECT DISTINCT(section_id),section FROM question_bank"""
            params = ()
            section = execute_query(sec_fetch,params,fetch=True)
            if section == []:
                return jsonify({'statusCode':404,'status':'section_id data does not exist'})
            for i in section:
                if i is not None:
                    sec_det['section_id'] = i[0]
                    sec_det['section'] = i[1]
                    det_params.append(sec_det)
                    sec_det = {}
                

        return jsonify({'statusCode':200,'status':"Success","background":other_params,'audit_plan_details':plan_dict})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/report_logo_data',methods=['GET','POST'])
def report_logo_data():
    try:
        
        title = request.form.get('title')
        sub_title = request.form.get('sub_title')
        title_company = request.form.get('title_company')
        title_name = request.form.get('title_name')
        title_contact = request.form.get('title_contact')
        title_address = request.form.get('title_address')
        last_updated = request.form.get('last_updated')
        filename = request.form.get('filename')
        audit_id = request.form.get('audit_id')
        total = request.files
        file_save = []
        validation = ['audit_id','last_updated']
        format_data = "%d-%m-%Y"
        date = datetime.strptime(last_updated, format_data)
        check = validate(validation)
        if check != {}:
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statuscode":400,"status":status})    
        query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        json_data = execute_query(query,params,fetch=True)
        if json_data == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        filename = json.loads(filename)
        if type(filename) != list:
            return jsonify({'statusCode':400,'status':'Invalid input type in filename'})
        report_logo = "Report Logo"
        for i in filename:
            org_path = parent_dir + "/" + str(report_logo)
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(audit_id))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            upload_path = os.path.join(user_path,str(i))
            file = total.get(i)
            path = upload_path
            file.save(path)
            file_save.append(path)
        query = """UPDATE report SET title = %s,title_name = %s,sub_title = %s,title_company = %s,title_contact = %s,title_address = %s,images = %s,logo_updated_date = %s WHERE audit_id = %s"""
        params = (title,title_name,sub_title,title_company,title_contact,title_address,file_save,date,audit_id,)
        execute_query(query,params)
        return jsonify({'statusCode':200,'status':'Report submitted successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/report_logo_get',methods = ['GET','POST'])
def report_logo_get():
    try:
        audit_id = request.json.get('audit_id')
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(query,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        zipfolder = ''
        report_logo = "Report Logo"
        check1 = parent_dir + "/" + report_logo
        bool1 = os.path.exists(check1)
        check2 = check1 + "/" + str(audit_id)
        bool2 = os.path.exists(check2)
        if bool1 is True and bool2 is True:
                archived = shutil.make_archive(check2, 'zip', check2)
                zipfolder = check2 + ".zip"
                bool3 = os.path.exists(zipfolder)
                if bool3 == True:
                    return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                else:
                    response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                    return response
        else:
            response = jsonify({"statusCode":"404","status":"No such files exist","message":"No such files exist"})
            return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch images","message":"Unable to fetch images" + str(e)})                                                                                                                                                                                    
        return response


@app.route('/report_edit',methods=['GET','POST'])
def report_edit():
    try:
        audit_id = request.json.get('audit_id')
        background = request.json.get('background')
        hfaz_data = request.json.get('hfaz_data')
        updated_by = request.json.get('updated_by')
        last_updated = request.json.get('last_updated')
        org_count = 0
        if audit_id is None or audit_id == "" or background is None or background == "" or updated_by == "" or updated_by is None or last_updated is None or last_updated =="":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:
            if type(background) != dict:
                return jsonify({'statusCode':400,'status':'Invalid input type in background'})
            if hfaz_data is not None and hfaz_data != "":
                if type(hfaz_data) != list:
                    return jsonify({'statusCode':400,'status':'Invalid input type in hfaz_data'})
                for i in hfaz_data:
                    mini_chck = """SELECT hfaz_id FROM hfaz WHERE hfaz_id = %s"""
                    params = (i,)
                    data = execute_query(mini_chck,params,fetch=True)
                    if data == []:
                        status = "Invalid hfaz_id: '{hfaz_id}' in hfaz_data".format(hfaz_id=i)
                        return jsonify({'statusCode':400,'status':status})
            format_data = "%d-%m-%Y"
            last_updated = datetime.strptime(last_updated, format_data)
            mini = """SELECT updated_count FROM report WHERE audit_id = %s"""
            params = (audit_id,)
            count = execute_query(mini,params,fetch=True)
            check = """SELECT user_id FROM users WHERE user_id = %s"""
            params = (updated_by,)
            user_id = execute_query(check,params,fetch=True)
            if user_id == []:
                return jsonify({'statusCode':400,'status':'Invalid auditor_id'})
            if count == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            else:
                if count[0][0] is None:
                    org_count = 1
                else:
                    org_count = int(count[0][0]) + 1
                if hfaz_data is not None or hfaz_data != "":
                    hfaz_tuple = tuple(hfaz_data)
                    query = """UPDATE report SET background_details = %s,updated_by = %s,last_updated = %s,updated_count = %s,hfaz_data = %s WHERE audit_id = %s"""
                    params = (json.dumps(background),updated_by,last_updated,org_count,hfaz_data,audit_id,)
                    execute_query(query,params)
                else:
                    query = """UPDATE report SET background_details = %s,updated_by = %s,last_updated = %s,updated_count = %s WHERE audit_id = %s"""
                    params = (json.dumps(background),updated_by,last_updated,org_count,audit_id,)
                    execute_query(query,params)
            return jsonify({'statusCode':200,'status':'Successfully edited report'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    
@app.route('/report_list',methods=['GET','POST'])
def report_list():
    try:
        userid = request.json.get('userid')
        dict = {}
        dict_params = []
        dummy = {}
        dummy_list = []
        query = """SELECT role,district_code FROM users WHERE user_id = %s"""
        params = (userid,)
        role = execute_query(query,params,fetch=True)
        if role == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if role[0][0] == 'CoERS' or role[0][0] == 'Owner':
            query = """SELECT audit_id FROM report"""
            params = ()
        elif role[0][0] == 'Lead Auditor':
            query = """SELECT DISTINCT(audit_assignment.audit_id) FROM users 
            INNER JOIN audit_assignment ON audit_assignment.auditor = users.user_id WHERE users.created_by = %s"""
            params = (userid,)
        elif role[0][0] == 'Auditor':
            return jsonify({'statusCode':300,'status':'This page is not accessible to auditor'})
        audit_id = execute_query(query,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':404,'status':'audit_assignment data does not exist'})
        mini = """SELECT status FROM report WHERE audit_id = %s"""
        params = (audit_id[0][0],)
        status = execute_query(mini,params,fetch=True)
        if status is None:
            return jsonify({'statusCode':404,'status':'Report status data does not exist'})
        for i in audit_id:
            if i is not None:
                query1 = """SELECT audit_type_id FROM audit_assignment WHERE audit_id = %s"""
                params = (i[0],)
                audit_type_id = execute_query(query1,params,fetch=True)
                if audit_type_id != []:
                    query2 = """SELECT audit_assignment.stretch_name,audit_type.road_type,audit_type.stage,audit_assignment.audit_id FROM audit_assignment
                    FULL JOIN audit_type ON audit_type.audit_type_id = audit_assignment.audit_type_id WHERE audit_type.audit_type_id = %s AND audit_assignment.status = %s"""
                    params = (audit_type_id[0][0],'Completed',)
                    stretch_details = execute_query(query2,params,fetch=True)
                    for j in stretch_details:
                        dict["audit_type_id"] = audit_type_id[0][0]
                        dict["stretch_name"] = j[0]
                        dict["road_type"] = j[1]
                        dict["stage"] = j[2]
                        dict["audit_id"] = j[3]
                        dict["status"] = status[0][0]
                        if role[0][0] == "Auditor":
                            dict['status'] = i[1]
                        if j[3] not in dummy_list:
                            dummy_list.append(j[3])
                            dict_params.append(dict)
                        dict = {}
                    dummy[audit_type_id[0][0]] = dict_params
                dict_params = []
                dummy_list = []
        return jsonify({'statusCode':200,'status':'Success','details':dummy})
    except Exception as e: 
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})
    

@app.route('/report_approval',methods=['GET','POST'])
def report_approval():
    try:
        audit_id = request.form.get('audit_id')
        approval = request.form.get('approval')
        file_name = request.form.get('file_name')
        # submitted_on = request.form.get('submitted_on')
        total = request.files      
        status = ""                                                                                                                                           
        report = "Report"
        submitted_on = datetime.now()
        if approval is None or approval == "" or audit_id == "" or audit_id is None:
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:     
            query0 = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            audit = execute_query(query0,params,fetch=True)
            if audit == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            else:
                if approval == "submit" or approval == "Submit": 
                    status = "Report Submitted"
                elif approval == "approve" or approval == "Approve":   
                    status = "Report Approved"
                elif approval == "reject" or approval == "Reject":
                    status = "Report Rejected"   
                else:
                    return jsonify({'statusCode':400,'status':'Invalid approval'})
                if approval == 'Submit' or approval == 'submit':
                    if file_name is None or file_name == "":
                        return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
                    # format_data = "%d-%m-%Y"
                    # submitted_on = datetime.strptime(submitted_on, format_data)
                    query0 = """SELECT audit_id,stretch_name FROM audit_assignment WHERE audit_id = %s"""
                    params = (audit_id,)
                    data = execute_query(query0,params,fetch=True)
                    org_path = parent_dir + "/" + report
                    bool1 = os.path.exists(org_path)
                    if bool1 is False:
                        os.makedirs(org_path)
                    user_path = os.path.join(org_path,str(data[0][1]))
                    bool2 = os.path.exists(user_path)
                    if bool2 is False:
                        os.makedirs(user_path)
                    audit_path = os.path.join(user_path,str(audit_id))
                    bool2 = os.path.exists(audit_path)
                    if bool2 is False:
                        os.makedirs(audit_path)   
                    file = total.get(file_name)
                    path = audit_path+"/"+file_name
                    file.save(path)
                    query1 = """UPDATE audit_assignment SET submitted_on = %s,status = %s WHERE audit_id = %s"""
                    params = (submitted_on,status,audit_id,)
                    execute_query(query1,params)
                    query = """UPDATE report SET status = %s,report = %s WHERE audit_id = %s RETURNING status"""
                    params = (status,path,audit_id,)   
                else:
                    query = """UPDATE report SET status = %s WHERE audit_id = %s RETURNING status"""
                    params = (status,audit_id,)
                data1 = execute_query(query,params,fetch=True)
                detail = "Report {} Successfully".format(status)
                query1 = """UPDATE audit_assignment SET submitted_on = %s,status = %s WHERE audit_id = %s"""
                params = (submitted_on,status,audit_id,)
                execute_query(query1,params)
                return jsonify({'statusCode':200,'status':detail,'detail':data1[0][0]})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})  
    
@app.route('/report_comment',methods=['GET','POST'])
def report_comment():
    try:
        audit_id = request.json.get('audit_id')
        page_no = request.json.get('page_no')
        section = request.json.get('section')
        comments = request.json.get('comments')
        date = request.json.get('date')
        format_data = "%d-%m-%Y"
        date = datetime.strptime(date, format_data)
        if date is None or date == "" or audit_id is None or audit_id == "" or page_no == "" or page_no is None or section is None or section == "" or comments == "" or comments is None:
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:   
            query0 = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            audit = execute_query(query0,params,fetch=True)
            mini = """SELECT DISTINCT(section) FROM question_bank WHERE section = %s"""
            params = (section,)
            sec = execute_query(mini,params,fetch=True)
            if sec == []:
                return jsonify({'statusCode':400,'status':'Invalid section'})
            if audit == []:
                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
            else:
                query = """INSERT INTO report_comment (audit_id,page_no,section,comments,comment_date) VALUES (%s,%s,%s,%s,%s)"""
                params = (audit_id,page_no,section,comments,date,)
                execute_query(query,params)
                return jsonify({'statusCode':200,'status':'Comment added successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/auditor_comment',methods=['GET','POST'])
def auditor_comment():
    try:
        user_id = request.json.get('user_id')
        audit_id = request.json.get('audit_id')
        s_no = request.json.get('s_no')
        comments = request.json.get('comments')
        date = request.json.get('date')
        format_data = "%d-%m-%Y"
        date = datetime.strptime(date, format_data)
        if date is None or date == "" or user_id is None or user_id == "" or s_no == "" or s_no is None:
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        else:   
            query0 = """SELECT auditor FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,)
            audit = execute_query(query0,params,fetch=True)
            if audit == []:
                return jsonify({'statusCode':400,'status':'Invalid auditor'})
            mini = """SELECT auditor_reply FROM report_comment WHERE s_no = %s"""
            params = (s_no,)
            reply = execute_query(mini,params,fetch=True)
            if reply[0][0] is not None:
                return jsonify({'statusCode':400,'status':'Reply to this comment already exists'})
            else:
                query = """UPDATE report_comment SET auditor_reply = %s,reply_date = %s WHERE s_no = %s"""
                params = (comments,date,s_no,)
                execute_query(query,params)
                return jsonify({'statusCode':200,'status':'Auditor comment added successfully'})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})  

@app.route('/report_comments_list',methods=['GET','POST'])
def report_comments_list():
    try:
        dict = {}
        dict_params = []
        query = """SELECT audit_id,page_no,section,comments,comment_date,auditor_reply,reply_date,s_no FROM report_comment"""
        params = ()
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'report data does not exist'})
        for i in data:
            dict["audit_id"] = i[0]
            dict["page_no"] = i[1]
            dict["section"] = i[2]
            dict["comments"] = i[3]
            dict['comment_date'] = i[4]
            dict['auditor_reply'] = i[5]
            dict['reply_date'] = i[6] 
            dict['s_no'] = i[7]
            dict_params.append(dict)
            dict = {}
        return jsonify({'statusCode':200,'status':'Comment added successfully','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/auditor_report_list',methods=['GET','POST'])
def auditor_report_list():
    try:
        userid = request.json.get('userid')
        dict = {}
        dict_params = []
        query = """SELECT role,district_code FROM users WHERE user_id = %s"""
        params = (userid,)
        role = execute_query(query,params,fetch=True)
        if role == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if role[0][0] == 'Lead Auditor' or role[0][0] == 'CoERS' or role[0][0] == 'Owner':
            return jsonify({'statusCode':300,'status':'This flow is only accessible to auditor'})
        elif role[0][0] == 'Auditor':
            query = """SELECT audit_id,status FROM report WHERE auditor = %s"""
            params = (userid,)
        elif role[0][0] == 'AE':
            query = """SELECT audit_id,status FROM audit_assignment WHERE ae_userid = %s"""
            params = (userid,)
        audit_id = execute_query(query,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':404,'status':'audit_id data does not exist'})
        for i in audit_id:
            mini = """SELECT status FROM report WHERE audit_id = %s"""
            params = (i[0],) 
            status = execute_query(mini,params,fetch=True)
                # return jsonify({'statusCode':404,'status':'report status data does not exist'})
            if i is not None and status != []:
                query1 = """SELECT audit_type_id FROM audit_assignment WHERE audit_id = %s"""
                params = (i[0],)
                audit_type_id = execute_query(query1,params,fetch=True)
                if audit_type_id != []:
                    query2 = """SELECT audit_type.stretch_name,audit_type.road_type,audit_type.stage,audit_plan.audit_type AS audit_plan_type FROM audit_type INNER JOIN audit_plan ON audit_plan.audit_type_id = audit_type.audit_type_id WHERE audit_type.audit_type_id = %s"""
                    params = (audit_type_id[0][0],)
                    stretch_details = execute_query(query2,params,fetch=True)
                    for j in stretch_details:
                        dict["audit_type_id"] = audit_type_id[0][0]
                        dict["stretch_name"] = j[0]
                        dict["road_type"] = j[1]
                        dict["stage"] = j[2]
                        dict["audit_id"] = i[0]
                        dict["audit_plan_type"] = j[3]
                        dict["status"] = status[0][0]
                        if role[0][0] == "Auditor":
                            dict['status'] = i[1]
                    dict_params.append(dict)
                dict = {}
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e: 
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})    

@app.route('/reg_img',methods = ['GET','POST'])
def reg_img():
    try:
        user_id = request.json.get('user_id')
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT user_id FROM users WHERE user_id = %s"""
        params = (user_id,)
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        else:
            zipfolder = ''
            register = "Register"
            check1 = parent_dir + "/" + register
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + user_id
            bool2 = os.path.exists(check2)
            if bool1 is True and bool2 is True:
                    archived = shutil.make_archive(check2, 'zip', check2)
                    zipfolder = check2 + ".zip"
                    bool3 = os.path.exists(zipfolder)
                    if bool3 == True:
                        return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                    else:
                        response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                        return response
            else:
                response = jsonify({"statusCode":"404","status":"No users registered","message":"No users registered"})
                return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch images","message":"Unable to fetch images" })                                                                                                                                                                                    
        return response

@app.route('/stretchwise_audit',methods=['GET','POST'])
def stretchwise_audit():
    try:
        audit_type_id = request.json.get('audit_type_id')
        dummy = []
        query = """SELECT audit_id FROM audit_assignment WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        for i in data:
            dummy.append(i[0])
        return jsonify({'statusCode':200,'status':"Success",'details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':"Failed to fetch data","message":'Failed to fetch details' + str(e)})

@app.route('/stretchwise_auditor_img',methods = ['GET','POST'])
def stretchwise_auditor_img():
    try:
        audit_type_id = request.json.get('audit_type_id')
        if audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT auditor,stretch_name FROM audit_assignment WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':404,'status':'Invalid audit_type_id'})
        target_path = parent_dir + "/" + id[0][1]
        for i in id:
            mini = """SELECT file_save FROM users WHERE user_id = %s"""
            params = (i[0],)
            data = execute_query(mini,params,fetch=True)
            if data[0][0] is not None:
                final_path = data[0][0]
                item = list(final_path)
                dict = item[0]
                dict_params = item[0].split('/')
                file_name = str(dict_params[-1])
                if not os.path.exists(target_path):
                    os.makedirs(target_path)
                # if not os.path.exists(to_path):
                #     os.makedirs(project_users)
                final_path = os.path.join(target_path,i[0])
                bool = os.path.exists(final_path)
                if bool is False:
                    os.makedirs(final_path)
                shutil.copy(dict,final_path)
                org_path = final_path + "/" + file_name
                first_name = str(i[0]) + ".jpg"
                path2 = os.path.join(final_path,first_name)
                os.rename(org_path,path2)
        archived = shutil.make_archive(target_path, 'zip', target_path)
        zipfolder = target_path+ ".zip"
        bool3 = os.path.exists(zipfolder)
        if bool3 == True:
            return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
        else:
            response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
            return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch team members","message":"Unable to fetch team members" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/userlist_img',methods = ['GET','POST'])
def userlist_img():
    try:
        role = request.json.get('role')
        if role is None or role == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        register = "Register"
        query = """SELECT user_id FROM users WHERE role = %s"""
        params = (role,)
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':404,'status':'Invalid role'})
        role_users = role + "_users"
        target_path = parent_dir + "/" + role_users 
        for i in id:
            mini = """SELECT file_save FROM users WHERE user_id = %s"""
            params = (i[0],)
            data = execute_query(mini,params,fetch=True)
            if data[0][0] is not None:
                final_path = data[0][0]
                item = list(final_path)
                dict = item[0]
                dict_params = item[0].split('/')
                file_name = str(dict_params[-1])
                if not os.path.exists(target_path):
                    os.makedirs(target_path)
                # if not os.path.exists(to_path):
                #     os.makedirs(project_users)
                final_path = os.path.join(target_path,i[0])
                bool = os.path.exists(final_path)
                if bool is False:
                    os.makedirs(final_path)
                shutil.copy(dict,final_path)
                org_path = final_path + "/" + file_name
                first_name = str(i[0]) + ".jpg"
                path2 = os.path.join(final_path,first_name)
                os.rename(org_path,path2)
        archived = shutil.make_archive(target_path, 'zip', target_path)
        zipfolder = target_path+ ".zip"
        bool3 = os.path.exists(zipfolder)
        if bool3 == True:
            return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
        else:
            response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
            return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch team members","message":"Unable to fetch team members" + str(e)})                                                                                                                                                                                    
        return response
    
@app.route('/audit_plan_kml',methods = ['GET','POST'])
def audit_plan_kml():
    try:
        audit_id = request.json.get('audit_id')
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT stretch_name FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        stretch_name = execute_query(query,params,fetch=True)
        if stretch_name == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        else:
            zipfolder = ''
            audit_plan = "Audit plan"
            check1 = parent_dir + "/" + audit_plan
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + str(stretch_name[0][0])
            bool2 = os.path.exists(check2)
            if bool1 is True and bool2 is True:
                    archived = shutil.make_archive(check2, 'zip', check2)
                    zipfolder = check2 + ".zip"
                    bool3 = os.path.exists(zipfolder)
                    if bool3 == True:
                        return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                    else:
                        response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                        return response
            else:
                response = jsonify({"statusCode":"404","status":"No kml files exist","message":"No kml files exist"})
                return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch kml file","message":"Unable to fetch kml file" })                                                                                                                                                                                    
        return response
    
@app.route('/audit_kml',methods = ['GET','POST'])
def audit_kml():
    try: 
        audit_id = request.json.get('audit_id')
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        else:
            zipfolder = ''
            audit = "Audit files"
            check1 = parent_dir + "/" + audit
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + str(audit_id)
            bool2 = os.path.exists(check2)
            if bool1 is True and bool2 is True:
                    archived = shutil.make_archive(check2, 'zip', check2)
                    zipfolder = check2 + ".zip"
                    bool3 = os.path.exists(zipfolder)
                    if bool3 == True:
                        return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                    else:
                        response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                        return response
            else:
                response = jsonify({"statusCode":"404","status":"No kml files exist","message":"No kml files exist"})
                return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch kml file","message":"Unable to fetch kml file" })                                                                                                                                                                                    
        return response
    
@app.route('/q_irc_imgs',methods = ['GET','POST'])
def q_irc_imgs():
    try:
        q_id = request.json.get('q_id')
        if q_id is None or q_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        # query = """SELECT irc_path FROM question_bank WHERE q_id = %s"""
        # params = (q_id,)
        # irc_path = execute_query(query,params,fetch=True)
        # if irc_path == []:
        #     return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        # else:
        zipfolder = ''
        irc = "irc_help_tool"
        check1 = parent_dir + "/" + irc
        bool1 = os.path.exists(check1)
        check2 = check1 + "/" + str(q_id)
        bool2 = os.path.exists(check2)
        if bool1 is True and bool2 is True:
                archived = shutil.make_archive(check2, 'zip', check2)
                zipfolder = check2 + ".zip"
                bool3 = os.path.exists(zipfolder)
                if bool3 == True:
                    return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                else:
                    response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                    return response
        else:
            response = jsonify({"statusCode":"404","status":"No q_id images exist","message":"No q_id images exist"})
            return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch images","message":"Unable to fetch images" })                                                                                                                                                                                    
        return response

@app.route('/option_images',methods = ['GET','POST'])
def option_images():
    try:
        q_id = request.json.get('q_id')
        org_choice = 'choices'
        moved = 'ans'
        query = """SELECT q_id FROM question_bank WHERE q_id = %s"""
        params = (q_id,)
        verify = execute_query(query,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid q_id'})
        else:
            # query = """SELECT img_path FROM master_table WHERE q_id = %s"""
            # params = (q_id,)
            # irc_path = execute_query(query,params,fetch=True)
            # if irc_path == []:
            #     return jsonify({'statusCode':400,'status':'Invalid q_id'})
            zipfolder = ''
            check1 = parent_dir + "/" + org_choice
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + str(q_id)
            bool2 = os.path.exists(check2)
            # irc_path = irc_path[0][0][0].split('/')
            # irc_path.remove(irc_path[-1])
            # irc_path = '/'.join(irc_path)
            # if check2 != irc_path:
            #     return jsonify({'statusCode':400,'status':'Invalid image path'})
            if bool1 is True and bool2 is True:
                    archived = shutil.make_archive(check2, 'zip', check2)
                    zipfolder = check2 + ".zip"
                    bool3 = os.path.exists(zipfolder)
                    if bool3 == True:
                        return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                    else:
                        response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                        return response
            else:
                response = jsonify({"statusCode":"404","status":"No q_id images exist","message":"No q_id images exist"})
                return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch team members","message":"Unable to fetch team members" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/ans_images', methods=['GET', 'POST'])
def ans_images():
    try:
        audit_id = request.json.get('audit_id')
        org_choice = 'answers'
        moved = 'audit answers'
 
        query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(query, params, fetch=True)
        # if verify == []:
            # return jsonify({'statusCode': 400, 'status': 'Invalid audit_id'})
        actual_path = os.path.join(parent_dir, org_choice)
        actual_mid = os.path.join(actual_path, audit_id)
        created_path = os.path.join(parent_dir, moved)
        created_mid = os.path.join(created_path, audit_id)
 
        if not os.path.exists(created_mid):
            os.makedirs(created_mid)
 
        file_list = os.listdir(actual_mid)
 
        for a in file_list:
            actual_mid1 = os.path.join(actual_mid, a)
            created_mid1 = os.path.join(created_mid, a)
 
            if not os.path.exists(created_mid1):
                os.makedirs(created_mid1)
 
            img_list = os.listdir(actual_mid1)
            for i in img_list:
                actual_final = os.path.join(actual_mid1, i)
                shutil.copy(actual_final, created_mid1)
 
        zip_path = created_path + ".zip"
        with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
            for root, _, files in os.walk(created_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, created_path)
                    zipf.write(file_path, arcname)
        shutil.rmtree(created_path)  
 
        if os.path.exists(zip_path):
            return send_file(zip_path, mimetype='application/zip', as_attachment=True)
        else:
            return jsonify({"statusCode": "400","status": "ZIP file not created","message": "ZIP file not created"})
    except Exception as e:
        return jsonify({"statusCode": "500","status": "Unable to fetch images","message": "Unable to fetch images"+str(e)})

@app.route('/dashboard_dd',methods=['GET','POST'])
def dashboard_dd():
    try:
        user_id = request.json.get('user_id')
        dummy = []
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        chck = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify = execute_query(chck,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        if verify[0][0] == 'CoERS' or verify[0][0] == 'Owner':
            query = """SELECT user_id FROM users WHERE role = %s"""
            params = ('Lead Auditor',)
            users = execute_query(query,params,fetch=True)
            if users == []:
                return jsonify({'statusCode':404,'status':'Lead Auditor data does not exist'})
            for i in users:
                dummy.append(i[0])
        elif verify[0][0] == 'Lead Auditor':
            query = """SELECT user_id FROM users WHERE created_by = %s"""
            params = (user_id,)
            users = execute_query(query,params,fetch=True)
            if users == []:
                return jsonify({'statusCode':404,'status':'Auditor data does not exist'})
            for i in users:
                dummy.append(i[0])
        else:
            status = 'Invalid role: user is {role}'.format(role=verify[0][0])
            return jsonify({'statusCode':400,'status':status})
        return jsonify({'statusCode':200,'status':'Success','details':dummy})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/dashboard',methods=['GET','POST'])
def dashboard():
    try:
        user_id = request.json.get('user_id')
        road_owning_agency = request.json.get('road_owning_agency')
        state = request.json.get('state')
        district = request.json.get('district')
        user = request.json.get('user')
        type_of_audit = request.json.get('audit_type')
        name_of_audit = request.json.get('audit_name')
        first_dict = {}
        dict = {}
        dist_dummy = {}
        dummy = {}
        param = []
        role_list = ['Owner','Lead Auditor','Auditor','CoERS']
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        if road_owning_agency is not None and road_owning_agency != "":
            chck1 = """SELECT road_owning_agency FROM dropdown_values WHERE road_owning_agency = %s"""
            params = (road_owning_agency,)
            verify1 = execute_query(chck1,params,fetch=True)
            if verify1 == []:
                return jsonify({'statusCode':400,'status':'Invalid road_owning_agency'})
        # if state is not None and state != "":
        #     chck2 = """SELECT state FROM audit_plan WHERE state = %s"""
        #     params = (state,)
        #     verify2 = execute_query(chck2,params,fetch=True)
        #     if verify2 == []:
        #         return jsonify({'statusCode':400,'status':'Invalid state'})
        # if district is not None and district != "":
        #     chck3 = """SELECT district FROM audit_plan WHERE district = %s"""
        #     params = (district,)
        #     verify3 = execute_query(chck3,params,fetch=True)
        #     if verify3 == []:
        #         return jsonify({'statusCode':400,'status':'Invalid district'})
        chck4 = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify4 = execute_query(chck4,params,fetch=True)
        if verify4 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        basic_query = """SELECT SUM(assn.stretch_length) AS total_stretch_audited,SUM(CASE WHEN assn.status IN 
                        ('Audit Completed', 'Report Submitted', 'Report Approved', 'Report Rejected') 
                        THEN assn.stretch_length END) AS completed_stretch,SUM(CASE WHEN assn.status IN ('Audit Assigned', 'Accepted') THEN assn.stretch_length 
                        END) AS assigned_stretch,SUM(CASE WHEN assn.status = 'Audit Started' THEN assn.stretch_length END) AS in_progress_stretch,
                        COUNT(CASE WHEN assn.status IN ('Audit Completed', 'Report Submitted', 'Report Approved', 'Report Rejected') THEN 1 END) AS completed_count,
                        COUNT(CASE WHEN assn.status IN ('Audit Assigned', 'Accepted') THEN 1 END) AS assigned_count,
                        COUNT(CASE WHEN assn.status = 'Audit Started' THEN 1 END) AS inprogress_count
                        FROM users us RIGHT JOIN audit_assignment assn ON us.user_id = assn.auditor 
                        RIGHT JOIN public.audit_plan ap ON ap.audit_type_id = assn.audit_type_id WHERE 1 = 1"""
        first_dict = {
                    "ap.road_owning_agency":road_owning_agency,
                    "ap.state":state,
                    "ap.district":district,
                    "ap.audit_type":type_of_audit,
                    "ap.stretch_name":name_of_audit
                    }
        if user is not None and user != "":
            chck5 = """SELECT role FROM users WHERE user_id = %s"""
            params = (user,)
            verify5 = execute_query(chck5,params,fetch=True)
            if verify5 == []:
                return jsonify({'statusCode':400,'status':'Invalid user'})
            if (verify4[0][0] == 'CoERS' or verify4[0][0] == 'Owner') and verify5[0][0] != 'Lead Auditor':
                status = 'Invalid role {j}:{i}'.format(j=verify4[0][0],i=verify5[0][0])
                return jsonify({'statusCode':400,'status':status})
            if verify4[0][0] == 'Lead Auditor' and verify5[0][0] != 'Auditor':
                status = 'Invalid role {j}:{i}'.format(j=verify4[0][0],i=verify5[0][0])
                return jsonify({'statusCode':400,'status':status})
            if verify4[0][0] == 'CoERS' or verify4[0][0] == 'Owner':
                first_dict["us.created_by"] = user
            elif verify4[0][0] == 'Lead Auditor':
                first_dict["us.user_id"] = user
        if verify4[0][0] == 'Lead Auditor':
            first_dict["us.created_by"] = user_id
        if verify4[0][0] == 'Auditor':
            first_dict['us.user_id'] = user_id
        for key,value in first_dict.items():
            if value is not None and value != "":
                basic_query+= f"AND {key} = %s "
                param.append(value)
        param = tuple(param)
        data = execute_query(basic_query,param,fetch=True)
        query2 = """select DISTINCT(ap.state),ap.state_name,SUM(assn.stretch_length)
                    from users us 
                    right join audit_assignment assn on us.user_id = assn.auditor 
                    right join public.audit_plan ap on ap.audit_type_id = assn.audit_type_id
                    where 1=1 """
        param = []
        for key,value in first_dict.items():
            if value is not None and value != "" and value != "0":
                query2+= f"AND {key} = %s "
                param.append(value)
        query2 += f"GROUP BY DISTINCT(ap.state),ap.state_name"
        param = tuple(param)
        state_data = execute_query(query2 ,param,fetch=True)
        query3 = """select DISTINCT(ap.district),ap.district_name,SUM(assn.stretch_length)
                    from users us 
                    right join audit_assignment assn on us.user_id = assn.auditor 
                    right join public.audit_plan ap on ap.audit_type_id = assn.audit_type_id 
                    WHERE 1=1 """
        param = []
        for key,value in first_dict.items():
            if value is not None and value != "" and value != "0":
                query3+= f"AND {key} = %s "
                param.append(value)
        query3 += f"GROUP BY DISTINCT(ap.district),ap.district_name"
        param = tuple(param)
        dist_data = execute_query(query3 ,param,fetch=True)
        if data == []:
            return jsonify({'statusCode':500,'status':'Audit data does not exist'})
        dict['total_stretch_audited'] = data[0][0]
        dict['completed_stretch'] = data[0][1]
        dict['assigned_stretch'] = data[0][2]
        dict['inprogress_stretch'] = data[0][3]
        dict['completed_count'] = data[0][4]
        dict['assigned_count'] = data[0][5]
        dict['inprogress_count'] = data[0][6]
        if state_data == []:
            dummy = {}
        for i in state_data:
            dummy[i[1]] = i[2]
        dict["km's_audited(statewise)"] = dummy
        if dist_data == []:
            dist_dummy = {}
        for i in dist_data:
            dist_dummy[i[1]] = i[2]
        dict["km's_audited(districtwise)"] = dist_dummy
        return jsonify({'statusCode':200,'status':'Success','details':dict})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/dashboard_map_owner',methods=['GET','POST'])
def dashboard_map_owner():
    try:
        user_id = request.json.get('user_id')
        road_owning_agency = request.json.get('road_owning_agency')
        state = request.json.get('state')
        district = request.json.get('district')
        type_of_audit = request.json.get('audit_type')
        name_of_audit = request.json.get('audit_name')
        user = request.json.get('user')
        locations_list = []
        param = []
        first_dict = {}
        dummy = {}
        locations_list2 = []
        dummy2 = {}
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        if road_owning_agency is not None and road_owning_agency != "":
            chck1 = """SELECT road_owning_agency FROM dropdown_values WHERE road_owning_agency = %s"""
            params = (road_owning_agency,)
            verify1 = execute_query(chck1,params,fetch=True)
            if verify1 == []:
                return jsonify({'statusCode':400,'status':'Invalid road_owning_agency'})
        # if state is not None and state != "":
        #     chck2 = """SELECT state FROM audit_plan WHERE state = %s"""
        #     params = (state,)
        #     verify2 = execute_query(chck2,params,fetch=True)
        #     if verify2 == []:
        #         return jsonify({'statusCode':400,'status':'Invalid state'})
        # if district is not None and district != "":
        #     chck3 = """SELECT district FROM audit_plan WHERE district = %s"""
        #     params = (district,)
        #     verify3 = execute_query(chck3,params,fetch=True)
        #     if verify3 == []:
        #         return jsonify({'statusCode':400,'status':'Invalid district'})
        chck4 = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify4 = execute_query(chck4,params,fetch=True)
        if verify4 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        first_dict = {
                    "audit_plan.road_owning_agency":road_owning_agency,
                    "audit_plan.state_name":state,
                    # "audit_plan.district":district,
                    "audit_plan.audit_type":type_of_audit,
                    "audit_plan.stretch_name":name_of_audit
                    }
        basic_query = """SELECT DISTINCT(geojson_total_stretch.audit_type_id),geojson_total_stretch.stretch_name,ST_AsGeoJSON(geojson_total_stretch.geometry),
         audit_assignment.status,geojson_total_stretch."Description",geojson_total_stretch."Name" FROM geojson_total_stretch
            INNER JOIN audit_plan ON geojson_total_stretch.audit_type_id = audit_plan.audit_type_id
			INNER JOIN audit_assignment ON geojson_total_stretch.audit_type_id = audit_assignment.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        basic_query2 = """SELECT DISTINCT(geojson_audit_stretch.audit_id),geojson_audit_stretch.stretch_name,ST_AsGeoJSON(geojson_audit_stretch.geometry),
        audit_assignment.auditor,audit_assignment.status,geojson_audit_stretch."Description",geojson_audit_stretch."Name" FROM geojson_audit_stretch
			INNER JOIN audit_assignment ON geojson_audit_stretch.audit_id = audit_assignment.audit_id
            INNER JOIN audit_plan ON audit_assignment.audit_type_id = audit_plan.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        if verify4[0][0] != 'Owner' and verify4[0][0] != 'CoERS':
            status = 'forbidden access:{role}'.format(role=verify4[0][0])
            return jsonify({'statusCode':403,'status':status})
        if user is not None and user != "":
            chck5 = """SELECT role FROM users WHERE user_id = %s"""
            params = (user,)
            verify5 = execute_query(chck5,params,fetch=True)
            if verify5 == []:
                return jsonify({'statusCode':400,'status':'Invalid user'})
            if (verify4[0][0] == 'CoERS' or verify4[0][0] == 'Owner') and verify5[0][0] != 'Lead Auditor':
                status = 'Invalid role: {j}:{i}'.format(j=verify4[0][0],i=verify5[0][0])
                return jsonify({'statusCode':400,'status':status})
            # if verify4[0][0] == 'Lead Auditor' or verify4[0][0] != 'Auditor':
            #     status = 'Invalid role {j}:{i}'.format(j=verify4[0][0],i=verify5[0][0])
            #     return jsonify({'statusCode':400,'status':status})
            first_dict['users.created_by'] = user
        if verify4[0][0] == 'Owner' or verify4[0][0] == 'CoERS':
            for key,value in first_dict.items():
                if value is not None and value != "" and value != "0":
                    basic_query+= f"AND {key} = %s "
                    basic_query2 += f"AND {key} = %s"
                    param.append(value)
        param = tuple(param)
        data = execute_query(basic_query,param,fetch=True)
        data2 = execute_query(basic_query2,param,fetch=True)
        for location in data:
            dummy["audit_type_id"] = location[0]
            dummy["stretch_name"] = location[1]
            dummy["geometry"] = json.loads(location[2])
            dummy["description"] = location[4]
            dummy["chainage"] = location[5]
            # dummy["status"] = location[3]
            dummy["type"] = "Feature"
            locations_list.append(dummy)
            dummy = {}
        for location in data2:
            dummy2["audit_id"] = location[0]
            dummy2["stretch_name"] = location[1]
            dummy2["geometry"] = json.loads(location[2])
            dummy2["description"] = location[5]
            dummy2["chainage"] = location[6]
            dummy2["status"] = location[4]
            dummy2["type"] = "Feature"
            locations_list2.append(dummy2)
            dummy2 = {}
        return jsonify({'statusCode':200,'status':'Success','location':locations_list,'audit_location':locations_list2})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/dashboard_map_ae',methods=['GET','POST'])
def dashboard_map_ae():
    try:
        user_id = request.json.get('user_id')
        road_owning_agency = request.json.get('road_owning_agency')
        state = request.json.get('state')
        district = request.json.get('district')
        user = request.json.get('user')
        type_of_audit = request.json.get('type_of_audit')
        name_of_audit = request.json.get('name_of_audit')
        locations_list = []
        dummy2 = {}
        param = []
        first_dict = {}
        dummy = {}
        locations_list2 = []
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        if road_owning_agency is not None and road_owning_agency != "":
            chck1 = """SELECT road_owning_agency FROM dropdown_values WHERE road_owning_agency = %s"""
            params = (road_owning_agency,)
            verify1 = execute_query(chck1,params,fetch=True)
            if verify1 == []:
                return jsonify({'statusCode':400,'status':'Invalid road_owning_agency'})
        if state is not None and state != "":
            chck2 = """SELECT state FROM audit_plan WHERE state = %s"""
            params = (state,)
            verify2 = execute_query(chck2,params,fetch=True)
            if verify2 == []:
                return jsonify({'statusCode':400,'status':'Invalid state'})
        if district is not None and district != "":
            chck3 = """SELECT district FROM audit_plan WHERE district = %s"""
            params = (district,)
            verify3 = execute_query(chck3,params,fetch=True)
            if verify3 == []:
                return jsonify({'statusCode':400,'status':'Invalid district'})
        chck4 = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify4 = execute_query(chck4,params,fetch=True)
        if verify4 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        first_dict = {
                    "audit_plan.road_owning_agency":road_owning_agency,
                    "audit_plan.state":state,
                    "audit_plan.district":district,
                    "audit_plan.audit_type":type_of_audit,
                    "audit_plan.stretch_name":name_of_audit
                    }
        basic_query = """SELECT DISTINCT(geojson_total_stretch.audit_type_id),geojson_total_stretch.stretch_name,ST_AsGeoJSON(geojson_total_stretch.geometry),
            audit_assignment.auditor,geojson_total_stretch."Description",geojson_total_stretch."Name" FROM geojson_total_stretch
			INNER JOIN audit_assignment ON geojson_total_stretch.audit_type_id = audit_assignment.audit_type_id
            INNER JOIN audit_plan ON audit_assignment.audit_type_id = audit_plan.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        basic_query2 = """SELECT DISTINCT(geojson_audit_stretch.audit_id),geojson_audit_stretch.stretch_name,ST_AsGeoJSON(geojson_audit_stretch.geometry),
            audit_assignment.auditor,audit_assignment.status,geojson_audit_stretch."Description",geojson_audit_stretch."Name" FROM geojson_audit_stretch
			INNER JOIN audit_assignment ON geojson_audit_stretch.audit_id = audit_assignment.audit_id
            INNER JOIN audit_plan ON audit_assignment.audit_type_id = audit_plan.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        if verify4[0][0] != 'AE':
            status = 'forbidden access:{role}'.format(role=verify4[0][0])
            return jsonify({'statusCode':403,'status':status})
        if user is not None and user != "":
            chck5 = """SELECT role FROM users WHERE user_id = %s"""
            params = (user,)
            verify5 = execute_query(chck5,params,fetch=True)
            if verify5 == []:
                return jsonify({'statusCode':400,'status':'Invalid user'})
            # if (verify4[0][0] == 'Lead Auditor') and verify5[0][0] != 'Auditor':
            #     status = 'Invalid role {j}:{i}'.format(j=verify4[0][0],i=verify5[0][0])
            #     return jsonify({'statusCode':400,'status':status})
        first_dict['audit_assignment.ae_userid'] = user_id
        if verify4[0][0] == 'Lead Auditor':
            for key,value in first_dict.items():
                if value is not None and value != ""  and value != "0":
                    basic_query+= f"AND {key} = %s "
                    param.append(value)
        param = tuple(param)
        data = execute_query(basic_query,param,fetch=True)
        data2 = execute_query(basic_query2,param,fetch=True)
        for location in data:
            dummy["audit_id"] = location[0]
            dummy["stretch_name"] = location[1]
            dummy["geometry"] = json.loads(location[2])
            # dummy["stretch_name"] = location[3]
            dummy["description"] = location[4]
            dummy["chainage"] = location[5]
            dummy["type"] = "Feature"
            locations_list.append(dummy)
            dummy = {}
        for location in data2:
            dummy2["audit_id"] = location[0]
            dummy2["stretch_name"] = location[1]
            dummy2["geometry"] = json.loads(location[2])
            dummy2["status"] = location[4]
            dummy2["type"] = "Feature"
            dummy2["description"] = location[5]
            dummy2["chainage"] = location[6]
            locations_list2.append(dummy2) 
            dummy2 = {}
        return jsonify({'statusCode':200,'status':'Success','location':locations_list,'audit_location':locations_list2})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/dashboard_map_la',methods=['GET','POST'])
def dashboard_map_la():
    try:
        user_id = request.json.get('user_id')
        road_owning_agency = request.json.get('road_owning_agency')
        state = request.json.get('state')
        district = request.json.get('district')
        user = request.json.get('user')
        type_of_audit = request.json.get('type_of_audit')
        name_of_audit = request.json.get('name_of_audit')
        locations_list = []
        dummy2 = {}
        param = []
        first_dict = {}
        dummy = {}
        locations_list2 = []
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        if road_owning_agency is not None and road_owning_agency != "":
            chck1 = """SELECT road_owning_agency FROM dropdown_values WHERE road_owning_agency = %s"""
            params = (road_owning_agency,)
            verify1 = execute_query(chck1,params,fetch=True)
            if verify1 == []:
                return jsonify({'statusCode':400,'status':'Invalid road_owning_agency'})
        if state is not None and state != "":
            chck2 = """SELECT state FROM audit_plan WHERE state = %s"""
            params = (state,)
            verify2 = execute_query(chck2,params,fetch=True)
            if verify2 == []:
                return jsonify({'statusCode':400,'status':'Invalid state'})
        if district is not None and district != "":
            chck3 = """SELECT district FROM audit_plan WHERE district = %s"""
            params = (district,)
            verify3 = execute_query(chck3,params,fetch=True)
            if verify3 == []:
                return jsonify({'statusCode':400,'status':'Invalid district'})
        chck4 = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify4 = execute_query(chck4,params,fetch=True)
        if verify4 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        first_dict = {
                    "audit_plan.road_owning_agency":road_owning_agency,
                    "audit_plan.state":state,
                    "audit_plan.district":district,
                    "audit_plan.audit_type":type_of_audit,
                    "audit_plan.stretch_name":name_of_audit
                    }
        basic_query = """SELECT DISTINCT(geojson_total_stretch.audit_type_id),geojson_total_stretch.stretch_name,ST_AsGeoJSON(geojson_total_stretch.geometry),
            audit_assignment.auditor,geojson_total_stretch."Description",geojson_total_stretch."Name" FROM geojson_total_stretch
			INNER JOIN audit_assignment ON geojson_total_stretch.audit_type_id = audit_assignment.audit_type_id
            INNER JOIN audit_plan ON audit_assignment.audit_type_id = audit_plan.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        basic_query2 = """SELECT DISTINCT(geojson_audit_stretch.audit_id),geojson_audit_stretch.stretch_name,ST_AsGeoJSON(geojson_audit_stretch.geometry),
            audit_assignment.auditor,audit_assignment.status,geojson_audit_stretch."Description",geojson_audit_stretch."Name" FROM geojson_audit_stretch
			INNER JOIN audit_assignment ON geojson_audit_stretch.audit_id = audit_assignment.audit_id
            INNER JOIN audit_plan ON audit_assignment.audit_type_id = audit_plan.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        if verify4[0][0] != 'Lead Auditor':
            status = 'forbidden access:{role}'.format(role=verify4[0][0])
            return jsonify({'statusCode':403,'status':status})
        if user is not None and user != "":
            chck5 = """SELECT role FROM users WHERE user_id = %s"""
            params = (user,)
            verify5 = execute_query(chck5,params,fetch=True)
            if verify5 == []:
                return jsonify({'statusCode':400,'status':'Invalid user'})
            if (verify4[0][0] == 'Lead Auditor') and verify5[0][0] != 'Auditor':
                status = 'Invalid role {j}:{i}'.format(j=verify4[0][0],i=verify5[0][0])
                return jsonify({'statusCode':400,'status':status})
        first_dict['users.created_by'] = user_id
        if verify4[0][0] == 'Lead Auditor':
            for key,value in first_dict.items():
                if value is not None and value != ""  and value != "0":
                    basic_query+= f"AND {key} = %s "
                    param.append(value)
        param = tuple(param)
        data = execute_query(basic_query,param,fetch=True)
        data2 = execute_query(basic_query2,param,fetch=True)
        for location in data:
            dummy["audit_id"] = location[0]
            dummy["stretch_name"] = location[1]
            dummy["geometry"] = json.loads(location[2])
            # dummy["stretch_name"] = location[3]
            dummy["description"] = location[4]
            dummy["chainage"] = location[5]
            dummy["type"] = "Feature"
            locations_list.append(dummy)
            dummy = {}
        for location in data2:
            dummy2["audit_id"] = location[0]
            dummy2["stretch_name"] = location[1]
            dummy2["geometry"] = json.loads(location[2])
            dummy2["status"] = location[4]
            dummy2["type"] = "Feature"
            dummy2["description"] = location[5]
            dummy2["chainage"] = location[6]
            locations_list2.append(dummy2) 
            dummy2 = {}
        return jsonify({'statusCode':200,'status':'Success','location':locations_list,'audit_location':locations_list2})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response
    
@app.route('/dashboard_map_auditor',methods=['GET','POST'])
def dashboard_map_auditor():
    try:
        user_id = request.json.get('user_id')
        road_owning_agency = request.json.get('road_owning_agency')
        state = request.json.get('state')
        district = request.json.get('district')
        # user = request.json.get('user')
        dummy2 = {}
        locations_list2 = []
        locations_list = []
        param = []
        first_dict = {}
        dummy = {}
        if user_id is None or user_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        if road_owning_agency is not None and road_owning_agency != "":
            chck1 = """SELECT road_owning_agency FROM dropdown_values WHERE road_owning_agency = %s"""
            params = (road_owning_agency,)
            verify1 = execute_query(chck1,params,fetch=True)
            if verify1 == []:
                return jsonify({'statusCode':400,'status':'Invalid road_owning_agency'})
        if state is not None and state != "":
            chck2 = """SELECT state FROM audit_plan WHERE state = %s"""
            params = (state,)
            verify2 = execute_query(chck2,params,fetch=True)
            if verify2 == []:
                return jsonify({'statusCode':400,'status':'Invalid state'})
        if district is not None and district != "":
            chck3 = """SELECT district FROM audit_plan WHERE district = %s"""
            params = (district,)
            verify3 = execute_query(chck3,params,fetch=True)
            if verify3 == []:
                return jsonify({'statusCode':400,'status':'Invalid district'})
        chck4 = """SELECT role FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify4 = execute_query(chck4,params,fetch=True)
        if verify4 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        first_dict = {
                    "audit_plan.road_owning_agency":road_owning_agency,
                    "audit_plan.state":state,
                    "audit_plan.district":district
                    }
        basic_query = """SELECT DISTINCT(geojson_audit_stretch.audit_id),geojson_audit_stretch.stretch_name,ST_AsGeoJSON(geojson_audit_stretch.geometry),
            audit_assignment.auditor,audit_assignment.status,geojson_audit_stretch."Description",geojson_audit_stretch."Name" FROM geojson_audit_stretch
			INNER JOIN audit_assignment ON geojson_audit_stretch.audit_id = audit_assignment.audit_id
            INNER JOIN audit_plan ON audit_assignment.audit_type_id = audit_plan.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        basic_query2 = """SELECT DISTINCT(geojson_total_stretch.audit_type_id),geojson_total_stretch.stretch_name,ST_AsGeoJSON(geojson_total_stretch.geometry),
         audit_assignment.status,geojson_total_stretch."Description",geojson_total_stretch."Name" FROM geojson_total_stretch
            INNER JOIN audit_plan ON geojson_total_stretch.audit_type_id = audit_plan.audit_type_id
			INNER JOIN audit_assignment ON geojson_total_stretch.audit_type_id = audit_assignment.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE 1=1"""
        if verify4[0][0] != 'Auditor':
            status = 'forbidden access:{role}'.format(role=verify4[0][0])
            return jsonify({'statusCode':403,'status':status})
        first_dict['audit_assignment.auditor'] = user_id
        if verify4[0][0] == 'Auditor':
            for key,value in first_dict.items():
                if value is not None and value != "":
                    basic_query+= f"AND {key} = %s "
                    basic_query2+= f"AND {key} = %s"
                    param.append(value)
        param = tuple(param)
        data = execute_query(basic_query,param,fetch=True)
        for location in data:
            dummy["audit_id"] = location[0]
            dummy["stretch_name"] = location[1]
            dummy["geometry"] = json.loads(location[2])
            dummy["status"] = location[4]   
            dummy["type"] = "Feature"
            dummy["description"] = location[5]
            dummy["chainage"] = location[6]
            locations_list.append(dummy)
            dummy = {}
        data2 = execute_query(basic_query2,param,fetch=True)
        for location in data2:
            dummy2["audit_type_id"] = location[0]
            dummy2["stretch_name"] = location[1]
            dummy2["geometry"] = json.loads(location[2])
            dummy2["description"] = location[4]
            dummy2["chainage"] = location[5]
            # dummy["status"] = location[3]
            dummy2["type"] = "Feature"
            locations_list2.append(dummy2)
            dummy2 = {}
        return jsonify({'statusCode':200,'status':'Success','audit_location':locations_list,'location':locations_list2})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response

# @app.route('/audit_details_old',methods = ['GET','POST'])
# def audit_details_old():
    try:
        user_id = request.json.get('user_id')
        dict = {}
        dict_params = []
        if user_id is not None or user_id != "":
            role_fetch = """SELECT role FROM users WHERE user_id = %s"""
            params = (user_id,)
            role = execute_query(role_fetch,params,fetch=True)
            if role == []:
                return jsonify({'statusCode':400,'status':'Invalid user_id'})
            if role[0][0] is not None:
                if role[0][0] == 'Lead Auditor':
                    main = """SELECT user_id FROM users WHERE created_by = %s"""
                    params = (user_id,) 
                    audit = execute_query(main,params,fetch=True)
                    if audit == []:
                        return jsonify({'statusCode':404,'status':'Data does not exist'})
                    else:
                        name = """SELECT first_name FROM users WHERE user_id = %s"""
                        params = (user_id,) 
                        first_name = execute_query(name,params,fetch=True)
                        for i in audit:
                            query = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                            audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id,audit_assignment.created_by,audit_assignment.status,audit_assignment.auditor_stretch,
                            audit_assignment.auditor,users.first_name,audit_assignment.ae_userid
                            FROM audit_assignment INNER JOIN users ON users.user_id = audit_assignment.auditor WHERE auditor = %s"""
                            params = (i[0],)
                            data = execute_query(query,params,fetch=True)
                            for j in data:
                                if j is None:
                                     return jsonify({'statusCode':400,'status':'Invalid audit_id'})
                                else:
                                    dict['audit_type'] = j[0]
                                    dict['stretch_name'] = j[1]
                                    dict['start_date'] = j[2]
                                    dict['submit_date'] = j[3]
                                    dict['auditor'] = j[4]
                                    dict['type_of_audit'] = j[5]
                                    dict['audit_plan_id'] = j[6]
                                    dict['audit_id'] = j[7]
                                    dict['assigned_by'] = j[8]
                                    dict['status'] = j[9]
                                    dict['auditor_stretch'] = j[10]
                                    dict['auditor'] = j[11]
                                    dict['auditor_name'] = j[12]
                                    dict['lead_auditor'] = first_name[0][0]
                                    dict['ae_userid'] = j[13]
                                    query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,audit_type FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                                    params = (j[6],j[0],)
                                    data2 = execute_query(query1,params,fetch=True)
                                    dict['state'] = data2[0][0]
                                    dict['district_name'] = data2[0][1]
                                    dict['name_of_road'] = data2[0][2]
                                    dict['road_number'] = data2[0][3]
                                    dict['no_of_lanes'] = data2[0][4]
                                    dict['road_owning_agency'] = data2[0][5]
                                    dict['chainage_start'] = data2[0][6]
                                    dict['chainage_end'] = data2[0][7]
                                    dict['location_start'] = data2[0][8]
                                    dict['location_end'] = data2[0][9]
                                    dict['latitude_start'] = data2[0][10]
                                    dict['latitude_end'] = data2[0][11]
                                    dict['stretch_length'] = data2[0][12]
                                    dict['audit_plan_type'] = data2[0][13]
                                    dict_params.append(dict)
                                    dict = {}
                    if dict_params == []:
                        return jsonify({'statusCode':200,'status':'No audits assigned to the auditor'})
                    return jsonify({'statusCode':200,'status':'Success','details':dict_params})
                elif role[0][0] == 'AE':
                    main = """SELECT user_id FROM users WHERE user_id = %s"""
                    params = (user_id,) 
                    audit = execute_query(main,params,fetch=True)
                    if audit == []:
                        return jsonify({'statusCode':404,'status':'User data does not exist'})
                    else:
                        name = """SELECT first_name FROM users WHERE user_id = %s"""
                        params = (user_id,) 
                        first_name = execute_query(name,params,fetch=True)
                        for i in audit:
                            query = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                            audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id,audit_assignment.created_by,audit_assignment.status,audit_assignment.auditor_stretch,
                            audit_assignment.auditor,users.first_name
                            FROM audit_assignment INNER JOIN users ON users.user_id = audit_assignment.ae_userid WHERE ae_userid = %s"""
                            params = (i[0],)
                            data = execute_query(query,params,fetch=True)
                            for j in data:
                                if j is None:
                                     return jsonify({'statusCode':400,'status':'Invalid audit_id'})
                                else:
                                    dict['audit_type'] = j[0]
                                    dict['stretch_name'] = j[1]
                                    dict['start_date'] = j[2]
                                    dict['submit_date'] = j[3]
                                    dict['auditor'] = j[4]
                                    dict['type_of_audit'] = j[5]
                                    dict['audit_plan_id'] = j[6]
                                    dict['audit_id'] = j[7]
                                    dict['assigned_by'] = j[8]
                                    dict['status'] = j[9]
                                    dict['auditor_stretch'] = j[10]
                                    dict['auditor'] = j[11]
                                    dict['auditor_name'] = j[12]
                                    dict['lead_auditor'] = first_name[0][0]
                                    query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,audit_type FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                                    params = (j[6],j[0],)
                                    data2 = execute_query(query1,params,fetch=True)
                                    dict['state'] = data2[0][0]
                                    dict['district_name'] = data2[0][1]
                                    dict['name_of_road'] = data2[0][2]
                                    dict['road_number'] = data2[0][3]
                                    dict['no_of_lanes'] = data2[0][4]
                                    dict['road_owning_agency'] = data2[0][5]
                                    dict['chainage_start'] = data2[0][6]
                                    dict['chainage_end'] = data2[0][7]
                                    dict['location_start'] = data2[0][8]
                                    dict['location_end'] = data2[0][9]
                                    dict['latitude_start'] = data2[0][10]
                                    dict['latitude_end'] = data2[0][11]
                                    dict['stretch_length'] = data2[0][12]
                                    dict['audit_plan_type'] = data2[0][13]
                                    dict_params.append(dict)
                                    dict = {}
                    if dict_params == []:
                        return jsonify({'statusCode':200,'status':'No audits assigned to the auditor'})
                    return jsonify({'statusCode':200,'status':'Success','details':dict_params})
                elif role[0][0] == 'CoERS' or role[0][0] == 'Owner':
                    main = """SELECT user_id FROM users"""
                    params = () 
                    audit = execute_query(main,params,fetch=True)
                    if audit == []:
                        return jsonify({'statusCode':404,'status':'Data does not exist'})
                    else:
                        name = """SELECT first_name FROM users WHERE user_id = %s"""
                        params = (user_id,) 
                        first_name = execute_query(name,params,fetch=True)
                        for i in audit:
                            query = """SELECT audit_assignment.audit_type_id,audit_assignment.stretch_name,audit_assignment.start_date,audit_assignment.submit_date,audit_assignment.auditor,
                            audit_assignment.type_of_audit,audit_assignment.audit_plan_id,audit_assignment.audit_id,audit_assignment.created_by,audit_assignment.status,audit_assignment.auditor_stretch,
                            audit_assignment.auditor,users.first_name,audit_assignment.ae_userid
                            FROM audit_assignment INNER JOIN users ON users.user_id = audit_assignment.auditor WHERE auditor = %s"""
                            params = (i[0],)
                            data = execute_query(query,params,fetch=True)
                            for j in data:
                                if j is None:
                                     return jsonify({'statusCode':400,'status':'Invalid audit_id'})
                                else:
                                    dict['audit_type'] = j[0]
                                    dict['stretch_name'] = j[1]
                                    dict['start_date'] = j[2]
                                    dict['submit_date'] = j[3]
                                    dict['auditor'] = j[4]
                                    dict['type_of_audit'] = j[5]
                                    dict['audit_plan_id'] = j[6]
                                    dict['audit_id'] = j[7]
                                    dict['assigned_by'] = j[8]
                                    dict['status'] = j[9]
                                    dict['auditor_stretch'] = j[10]
                                    dict['auditor'] = j[11]
                                    dict['auditor_name'] = j[12]
                                    dict['ae_userid'] = j[13]
                                    dict['lead_auditor'] = first_name[0][0]
                                    query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,audit_type FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                                    params = (j[6],j[0],)
                                    data2 = execute_query(query1,params,fetch=True)
                                    dict['state'] = data2[0][0]
                                    dict['district_name'] = data2[0][1]
                                    dict['name_of_road'] = data2[0][2]
                                    dict['road_number'] = data2[0][3]
                                    dict['no_of_lanes'] = data2[0][4]
                                    dict['road_owning_agency'] = data2[0][5]
                                    dict['chainage_start'] = data2[0][6]
                                    dict['chainage_end'] = data2[0][7]
                                    dict['location_start'] = data2[0][8]
                                    dict['location_end'] = data2[0][9]
                                    dict['latitude_start'] = data2[0][10]
                                    dict['latitude_end'] = data2[0][11]
                                    dict['stretch_length'] = data2[0][12]
                                    dict['audit_plan_type'] = data2[0][13]
                                    dict_params.append(dict)
                                    dict = {}
                    if dict_params == []:
                        return jsonify({'statusCode':200,'status':'No audits assigned to the auditor'})
                    return jsonify({'statusCode':200,'status':'Success','details':dict_params})
                elif role[0][0] == 'Auditor':
                    name = """SELECT audit_id FROM audit_assignment WHERE auditor = %s"""
                    params = (user_id,) 
                    audit_id = execute_query(name,params,fetch=True)
                    for i in audit_id:
                        query = """SELECT audit_type_id,stretch_name,start_date,submit_date,auditor,type_of_audit,audit_plan_id,audit_id,created_by,status,auditor_stretch,auditor FROM audit_assignment WHERE audit_id = %s"""
                        params = (i[0],)
                        data = execute_query(query,params,fetch=True)
                        for j in data:
                            if j is None:
                                return jsonify({'statusCode':400,'status':'Invalid audit_id'})
                            else:
                                dict['audit_type'] = j[0]
                                dict['stretch_name'] = j[1]
                                dict['start_date'] = j[2]
                                dict['submit_date'] = j[3]
                                dict['auditor'] = j[4]
                                dict['type_of_audit'] = j[5]
                                dict['audit_plan_id'] = j[6]
                                dict['audit_id'] = j[7]
                                dict['assigned_by'] = j[8]
                                dict['status'] = j[9]
                                dict['auditor_stretch'] = j[10]
                                dict['auditor'] = j[11]
                                query1 = """SELECT state_name,district_name,name_of_road,road_number,no_of_lanes,road_owning_agency,chainage_start,chainage_end,location_start,location_end,latitude_start,latitude_end,stretch_length,audit_type FROM audit_plan WHERE audit_plan_id = %s AND audit_type_id = %s"""
                                params = (j[6],j[0],)
                                data2 = execute_query(query1,params,fetch=True)
                                dict['state'] = data2[0][0]
                                dict['district_name'] = data2[0][1]
                                dict['name_of_road'] = data2[0][2]
                                dict['road_number'] = data2[0][3]
                                dict['no_of_lanes'] = data2[0][4]
                                dict['road_owning_agency'] = data2[0][5]
                                dict['chainage_start'] = data2[0][6]
                                dict['chainage_end'] = data2[0][7]
                                dict['location_start'] = data2[0][8]
                                dict['location_end'] = data2[0][9]
                                dict['latitude_start'] = data2[0][10]
                                dict['latitude_end'] = data2[0][11]
                                dict['stretch_length'] = data2[0][12]
                                dict['audit_plan_type'] = data2[0][13]
                                dict_params.append(dict)
                                dict = {}
                    if dict_params == []:
                        return jsonify({'statusCode':200,'status':'No audits assigned to the auditor'})    
                    return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})
    
@app.route('/audit_details', methods=['POST'])
def audit_details():
    try:
        payload = request.json
        user_id = payload.get('user_id')

        if not user_id:
            return jsonify({'statusCode': 400, 'status': 'user_id is required'})

        role_query = "SELECT role, first_name FROM users WHERE user_id = %s"
        role_data = execute_query(role_query, (user_id,), fetch=True)

        if not role_data:
            return jsonify({'statusCode': 400, 'status': 'Invalid user_id'})

        role, first_name = role_data[0]

        audit_query = """
            SELECT 
                aa.audit_type_id, aa.stretch_name, aa.start_date, aa.submit_date,
                aa.auditor, aa.type_of_audit, aa.audit_plan_id, aa.audit_id,
                aa.created_by, aa.status, aa.auditor_stretch,
                u.first_name, aa.ae_userid,
                ap.state_name, ap.district_name, ap.name_of_road, ap.road_number,
                ap.no_of_lanes, ap.road_owning_agency, ap.chainage_start,
                ap.chainage_end, ap.location_start, ap.location_end,
                ap.latitude_start, ap.latitude_end, ap.stretch_length, ap.audit_type
            FROM audit_assignment aa
            JOIN users u ON u.user_id = aa.auditor
            JOIN audit_plan ap ON ap.audit_plan_id = aa.audit_plan_id
                             AND ap.audit_type_id = aa.audit_type_id
            WHERE 1=1
        """

        params = []

        # ---------------- ACL CONDITIONS ---------------- #
        if role == 'Lead Auditor':
            audit_query += " AND aa.auditor IN (SELECT user_id FROM users WHERE created_by = %s)"
            params.append(user_id)

        elif role == 'AE':
            audit_query += " AND aa.ae_userid = %s"
            params.append(user_id)

        elif role in ('CoERS', 'Owner'):
            pass

        elif role == 'Auditor':
            audit_query += " AND aa.auditor = %s"
            params.append(user_id)

        else:
            return jsonify({'statusCode': 403, 'status': 'Unauthorized role'})
        if payload.get('audit_plan_type'):
            audit_query += " AND ap.audit_type = %s"
            params.append(payload['audit_plan_type'])

        if payload.get('stretch_name'):
            audit_query += " AND aa.stretch_name ILIKE %s"
            params.append(f"%{payload['stretch_name']}%")

        if payload.get('road_owning_agency'):
            audit_query += " AND ap.road_owning_agency = %s"
            params.append(payload['road_owning_agency'])

        if payload.get('state_code'):
            audit_query += " AND ap.state = %s"
            params.append(payload['state'])

        if payload.get('state_name'):
            audit_query += " AND ap.state_name = %s"
            params.append(payload['state_name'])

        data = execute_query(audit_query, tuple(params), fetch=True)

        audit_list = []
        for j in data:
            audit_list.append({
                'audit_type': j[0],
                'stretch_name': j[1],
                'start_date': j[2],
                'submit_date': j[3],
                'auditor': j[4],
                'type_of_audit': j[5],
                'audit_plan_id': j[6],
                'audit_id': j[7],
                'assigned_by': j[8],
                'status': j[9],
                'auditor_stretch': j[10],
                'auditor_name': j[11],
                'ae_userid': j[12],
                'lead_auditor': first_name,
                'state': j[13],
                'district_name': j[14],
                'name_of_road': j[15],
                'road_number': j[16],
                'no_of_lanes': j[17],
                'road_owning_agency': j[18],
                'chainage_start': j[19],
                'chainage_end': j[20],
                'location_start': j[21],
                'location_end': j[22],
                'latitude_start': j[23],
                'latitude_end': j[24],
                'stretch_length': j[25],
                'audit_plan_type': j[26]
            })

        if not audit_list:
            return jsonify({'statusCode': 200, 'status': 'No audits assigned to the auditor'})

        return jsonify({'statusCode': 200, 'status': 'Success', 'details': audit_list})

    except Exception as e:
        return jsonify({'statusCode': 500, 'status': 'Failed to fetch data ' + str(e)})


@app.route('/audit_sectionwise',methods=['GET','POST'])
def audit_sectionwise():
    try:
        audit_id = request.json.get('audit_id')
        dict = {}
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT DISTINCT(question_bank.section),answer_auditwise.section_id FROM answer_auditwise 
        INNER JOIN question_bank ON answer_auditwise.section_id = question_bank.section_id WHERE audit_id = %s"""
        params = (audit_id,)    
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'section data does not exist'})
        for i in data:
            dict[i[1]] = i[0] 
        return jsonify({'statusCode':200,'status':'Success','details':dict})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response
    
@app.route('/get_stretch_length',methods=['GET','POST'])
def get_stretch_length():
    try:
        audit_type_id = request.json.get('audit_type_id')
        if audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill all the data'})
        query = """SELECT stretch_length FROM audit_plan WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'stretch_length data does not exist'})
        return jsonify({'statusCode':200,'status':'Success',"total_stretch_length":data[0][0]})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)}) 

@app.route('/team_details',methods=['GET','POST'])
def team_details():
    try:
        audit_type_id = request.json.get('audit_type_id')
        dict = {}
        dict2 = {}
        dict_params = []
        query0 = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params=  (audit_type_id,)
        check = execute_query(query0,params,fetch=True)
        if check == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query = """SELECT audit_assignment.auditor,users.first_name,users.designation,users.email FROM audit_assignment 
        LEFT JOIN users ON audit_assignment.auditor = users.user_id WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        data = execute_query(query,params,fetch=True)
        query2 = """SELECT aa.field_user,u.first_name,u.designation,u.email FROM audit_assignment aa 
        LEFT JOIN users u ON aa.auditor = u.user_id WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        data2 = execute_query(query2,params,fetch=True)
        if data == []:
            return jsonify({'status':404,'status':'audit_assignment data does not exist'})
        for i in data:
            dict['auditor'] = i[1]
            dict['designation'] = i[2]
            dict['email'] = i[3]
            dict_params.append(dict)
            dict = {}
        if data2 != []:
            dict['auditor'] = i[1]
            dict['designation'] = i[2]
            dict['email'] = i[3]
            dict_params.append(dict)
        return jsonify({'statusCode':200,'status':'Successfully fetch team details','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})     

@app.route('/critical_observation',methods=['GET','POST'])
def critical_observation():
    try:
        audit_id = request.json.get('audit_id')
        store = {}
        dict =  {}
        dummy = {}
        dont_want = ['A','B']
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT section_id,section_count FROM answer_auditwise WHERE audit_id = %s AND critical_obs = %s"""
        params = (audit_id,True,)
        json_data = execute_query(query,params,fetch=True)
        if json_data == []:
            return jsonify({'statusCode':404,'status':'section_id data does not exist'})
        query1 = """SELECT answer_auditwise.section_id,question_bank.section,answer_auditwise.section_count,answer_auditwise.q_id,answer_auditwise.answer,answer_auditwise.issues,
                question_bank.conditions,question_bank.field_type,question_bank.functionality,question_bank.irc_help_tool,question_bank.master_table,question_bank.questions,
                answer_auditwise.issues,question_bank.data_type,answer_auditwise.new_issue,answer_auditwise.new_suggestion,answer_auditwise.ae_approval,answer_auditwise.ae_comments FROM answer_auditwise
                INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id WHERE answer_auditwise.audit_id = %s AND answer_auditwise.critical_obs = %s
                AND answer_auditwise.section_id NOT IN %s AND answer_auditwise.delete_status is not %s"""
        params = (audit_id,True,tuple(dont_want),True,)
        data = execute_query(query1,params,fetch=True)
        for i in data:
            section = i[1]
            section_count = i[2]
            dummy['answer'] = i[4]
            dummy['conditions'] = i[6]
            dummy['data_type'] = i[13]
            dummy['field_type'] = i[7]
            dummy['functionality'] = i[8]
            dummy['irc_help_tool'] = i[9]
            dummy['master_table'] = i[10]
            dummy['question'] = i[11]
            dummy['question_id'] = i[3]
            dummy['retrieval_id'] = list(i[12].values()) if i[12] is not None else []
            dummy['section'] = i[1]
            dummy['section_id'] = i[0]
            dummy['section_count'] = section_count
            dummy['new_issue'] = i[14]
            dummy['new_suggestion'] = i[15]
            dummy['ae_approval'] = i[16]
            dummy['ae_status'] = i[17]
            if section not in store:
                store[section] = {}
            if section_count not in store[section]:
                store[section][section_count] = []
            store[section][section_count].append(dummy)
            dummy = {}
        return jsonify({'statusCode':200,'status':"Success",'details':store})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})
    
# @app.route('/general_observation_old',methods=['GET','POST'])
# def general_observation():   
    try:
        audit_id = request.json.get('audit_id')
        dummy = {}
        extra = {}
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        query = """SELECT DISTINCT(roadside) FROM answer_auditwise WHERE audit_id = %s AND general_obs = %s"""
        params = (audit_id,True,)
        road_side = execute_query(query,params,fetch=True)
        if road_side == []:
            return jsonify({'statusCode':500,'status':'roadside data does not exist'})
        query3 = """SELECT answer_auditwise.s_no,chainage,answer_auditwise.gps_location,
        answer_auditwise.issues,question_bank.section,answer_auditwise.section_count,answer_auditwise.roadside FROM answer_auditwise
        INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id WHERE answer_auditwise.audit_id = %s
		AND answer_auditwise.general_obs = %s AND answer_auditwise.section_id NOT IN %s"""
        params = (audit_id,True,('A','B'))
        data= execute_query(query3,params,fetch=True)
        for i in data:
            section = i[4]
            chainage = i[1]
            s_no = i[0]
            gps_location = i[2]
            issues = list(dict(i[3]).values()) if i[3] is not None else []
            section_count = i[5]
            roadside = i[6]
            dummy['section'] = section
            dummy['chainage'] = chainage
            dummy['s_no'] = s_no
            dummy['gps_location'] = gps_location
            dummy['issues'] = issues
            dummy['section_count'] = section_count
            dummy['roadside'] = roadside
            if section not in extra:
                extra[section] = {}
            if roadside not in extra[section]:
                extra[section][roadside] = []
            extra[section][roadside].append(dummy)
            dummy = {}
        return jsonify({'statusCode':200,'status':"Success",'details':extra})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/general_observation', methods=['GET', 'POST'])
def general_observation():   
    try:
        audit_id = request.json.get('audit_id')
        dummy = {}
        extra = {}
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode': 400, 'status': 'Incomplete data please fill all the details'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check, params, fetch=True)
        if verify == []:
            return jsonify({'statusCode': 400, 'status': 'Invalid audit_id'})
        query = """SELECT DISTINCT(roadside) FROM answer_auditwise WHERE audit_id = %s AND general_obs = %s"""
        params = (audit_id, True)
        road_side = execute_query(query, params, fetch=True)
        if road_side == []:
            return jsonify({'statusCode': 500, 'status': 'Data does not exist'})
        query3 = """SELECT answer_auditwise.s_no,chainage,
                    answer_auditwise.gps_location,answer_auditwise.issues,question_bank.section,answer_auditwise.section_count,answer_auditwise.roadside,answer_auditwise.ae_comments,answer_auditwise.ae_approval
                    FROM answer_auditwise INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id
                    WHERE answer_auditwise.audit_id = %s
                      AND question_bank.questions ILIKE %s AND answer_auditwise.answer = %s AND answer_auditwise.section_id NOT IN %s AND answer_auditwise.delete_status is not %s"""
        params = (audit_id,'General observation','true',('A','B'),True)
        data = execute_query(query3, params, fetch=True)
        seen_roadsides = set() 
        for i in data:
            section = i[4]
            chainage = i[1]
            s_no = i[0]
            gps_location = i[2]
            issues = list(dict(i[3]).values()) if i[3] is not None else []
            section_count = i[5]    
            roadside = i[6]
            comments = i[7]
            approval = i[8]
            if roadside not in seen_roadsides:
                seen_roadsides.add(roadside)
                dummy['section'] = section
                dummy['chainage'] = chainage
                # dummy['s_no'] = s_no
                dummy['gps_location'] = gps_location
                dummy['issues'] = issues
                dummy['ae_comments'] = comments
                dummy['ae_approval'] = approval
                # dummy['section_count'] = section_count
                # dummy['roadside'] = roadside
                
                if section not in extra:
                    extra[section] = {}
                if roadside not in extra[section]:
                    extra[section][roadside] = []
                extra[section][roadside].append(dummy)
                dummy = {} 
        
        return jsonify({'statusCode': 200, 'status': "Success", 'details': extra})
    
    except Exception as e:
        return jsonify({'statusCode': 500, 'status': 'Internal server error ' + str(e)})

@app.route('/sub_section',methods=['GET','POST'])
def sub_section():
    try:
       audit_id = request.json.get('audit_id')
       dict = {}
       category = ' Category'
       query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
       params = (audit_id,)
       data = execute_query(query,params,fetch=True)
       if data == []:
           return jsonify({'statusCode':400,'status':'Invalid audit_id'})
       query1 = """SELECT audit_assignment.audit_type_id,audit_type.sections FROM audit_assignment 
                    INNER JOIN audit_type ON audit_assignment.audit_type_id  = audit_type.audit_type_id WHERE audit_id = %s"""
       params = (audit_id,)
       sections = execute_query(query1,params,fetch=True)
       if sections == []:
           return jsonify({'statusCode':500,'status':'audit_assignment data does not exist'})
       section_name = sections[0][1]
       for i in section_name:
           if i == 'Road Sign' or i == 'Road Marking':
               section_name.remove(i)
           sub_section = i + category
           query2 = """SELECT q_id,questions FROM question_bank WHERE section = %s"""
           params = (i,)
           q_data = execute_query(query2,params,fetch=True)
           for j in q_data:
               if j[1] == sub_section:
                   dict[j[0]] = j[1]
       return jsonify({'statusCode':200,'status':"Success","details":dict,'total':section_name})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})
        
@app.route('/report_plan_data',methods=['GET','POST'])
def report_plan_data():
    try:
        audit_id = request.json.get('audit_id')
        plan_details = {}
        logo = {}
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        get_q = """SELECT audit_plan_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        plan_id = execute_query(get_q,params,fetch=True)
        if plan_id == []:
            return jsonify({'statusCode':500,'status':'Data does not exist'})
        query0 = """SELECT road_type_id,stage_id from question_bank qb inner join audit_type au on au.road_type = qb.road_type and au.stage = qb.stage
         inner join audit_assignment ad on ad.audit_type_id = au.audit_type_id where ad.audit_id = %s"""
        params = (audit_id,)
        data0 = execute_query(query0,params,fetch=True)
        ids = str(data0[0][0]) +'.'+ str(data0[0][1]) 
        plan_q = """SELECT ap.audit_type_id,ap.stretch_name,ap.state,ap.district_name,ap.name_of_road,ap.road_number,ap.no_of_lanes,ap.road_owning_agency,ap.chainage_start,ap.chainage_end,
        ap.location_start,ap.location_end,ap.latitude_start,ap.latitude_end,ap.stretch_length,ap.audit_plan_id,au.road_type FROM audit_plan ap 
		INNER JOIN audit_type au ON au.audit_type_id = ap.audit_type_id WHERE audit_plan_id = %s"""
        params = (plan_id[0][0],)
        plan_data = execute_query(plan_q,params,fetch=True)
        query2 = """SELECT answer FROM answer_auditwise WHERE audit_id = %s AND q_id = %s"""
        params = (audit_id,ids + '.' +'A.9')
        ans_data2 = execute_query(query2,params,fetch=True)
        query3 = """SELECT answer FROM answer_auditwise WHERE audit_id = %s AND q_id = %s"""
        params = (audit_id,ids+ '.' +'A.6')
        ans_data3 = execute_query(query3,params,fetch=True)

        query4 = """CREATE OR REPLACE FUNCTION
                    get_landuse(aud_id TEXT,qid TEXT)
                    RETURNS TEXT[] AS $$
                    DECLARE
                        answers TEXT[];
                    BEGIN
                        SELECT ARRAY(SELECT answer FROM answer_auditwise WHERE audit_id = aud_id AND q_id = qid) INTO answers;
                        RETURN answers;
                        END;
                    $$ LANGUAGE plpgsql;
                    SELECT get_landuse(%s,%s);"""
        params = (audit_id,ids+ '.' +'I.5')
        ans_data4 = execute_query(query4,params,fetch=True)
        query5 = """SELECT answer FROM answer_auditwise WHERE audit_id = %s AND q_id = %s"""
        params = (audit_id,ids+ '.' +'A.5')
        ans_data5 = execute_query(query5,params,fetch=True)
        query6 = """SELECT answer FROM answer_auditwise WHERE audit_id = %s AND q_id = %s"""
        params = (audit_id,ids+ '.' +'A.7')
        ans_data6 = execute_query(query6,params,fetch=True)
        if plan_data == []:
            plan_details = {}
        for i in plan_data:
            if i is not None:
                plan_details = { 
                            "audit_type_id":i[0],
                            "stretch_name":i[1],
                            "state":i[2],
                            "district":i[3],
                            "name_of_road":i[4],
                            "road_number":i[5],
                            "no_of_lanes":i[6],
                            "road_owning_agency":i[7],
                            "chainage_start":i[8],
                            "chainage_end":i[9],
                            "location_start":i[10],
                            "location_end":i[11],
                            "latitude_start":i[12],
                            "latitude_end":i[13],
                            "stretch_length":i[14],
                            "audit_plan_id":i[15],
                            "road_type":i[16],
                            "carriageway_width": str(ans_data2[0][0]) + " m" if ans_data2!= [] else "NA",
                            "shoulder_type": ans_data3[0][0] if ans_data3 != [] else "NA",
                            "landuse_pattern":ans_data4[0][0] if ans_data4!= [] else "NA",
                            "terrain_type":ans_data5[0][0] if ans_data5!= [] else "NA",
                            "pavement_type":ans_data6[0][0] if ans_data6!= [] else "NA"
                        }
        logo_det = """SELECT title,sub_title,title_name,title_company,title_contact,title_address FROM report WHERE audit_id = %s"""
        params = (audit_id,)
        logo_get = execute_query(logo_det,params,fetch=True)
        if logo_get == []:
            logo = {}
        else:
            logo = {
                "title":logo_get[0][0],
                "sub_title":logo_get[0][1],
                "title_name":logo_get[0][2],
                "title_company":logo_get[0][3],
                "title_contact":logo_get[0][4],
                "title_address":logo_get[0][5]
            }
        return jsonify({'statusCode':200,'status':"Success","details":plan_details,"logo_details":logo})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})

@app.route('/report_issue',methods=['GET','POST'])
def report_issue():
    try:
        audit_id = request.json.get('audit_id')
        dict = {}
        dummy = []
        dict_params = []
        dummy_dict = {}
        empty_string = ''
        # section = ('Start Audit Details','End Audit Details')
        query = """SELECT retrieval_ids,section_id,section_count FROM answer_auditwise WHERE audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        hfaz_q = """SELECT hfaz_id,start_chainage,end_chainage FROM hfaz WHERE audit_id = %s"""
        params = (audit_id,)
        hfaz_id = execute_query(hfaz_q,params,fetch=True)
        if hfaz_id == []:
            return jsonify({'statusCode':500,'status':'hfaz data does not exist'})
        for a in hfaz_id:
            start = a[1]
            end = a[2]
            query1 = """SELECT question_bank.section,answer_auditwise.retrieval_ids,answer_auditwise.section_count,answer_auditwise.section_id,answer_auditwise.chainage
             FROM answer_auditwise INNER JOIN question_bank ON answer_auditwise.section_id = question_bank.section_id
              WHERE answer_auditwise.audit_id = %s AND answer_auditwise.chainage >= %s AND answer_auditwise.chainage <= %s AND answer_auditwise.section_id NOT IN %s"""
            params = (audit_id,start,end,('A','B'))
            sec = execute_query(query1,params,fetch=True)
            if sec != []:
                for i in sec:
                    if i[1] is not None:
                        dummy_tuple = tuple(i[1])
                        query2 = """SELECT section,issue FROM retrieval_id WHERE retrieval_id IN %s AND section = %s"""
                        params = (dummy_tuple,i[0],)
                        ret_id = execute_query(query2,params,fetch=True)
                        if ret_id != []:
                            for b in ret_id:        
                                dummy.append(b[1])
                            empty_string = i[0] + '(' + str(i[2]) + ')'
                        dict[empty_string] = dummy
                        dummy = []
            hfaz = a[0]   
            dummy_dict[hfaz] = dict
            dict = {}     
        return jsonify({'statusCode':200,'status':"Success","details":dummy_dict})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)}) 

@app.route('/admin_report_list',methods=['GET','POST'])
def admin_report_list():
    try:
        userid = request.json.get('userid')
        dict = {}
        dict_params = []
        dummy = {}
        dummy_list = []
        query = """SELECT role,district_code FROM users WHERE user_id = %s"""
        params = (userid,)
        get_status = ('Report Submitted','Report Approved')
        print(get_status,'get'  )
        role = execute_query(query,params,fetch=True)
        if role == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if role[0][0] == 'CoERS' or role[0][0] == 'Owner':
            query = """SELECT audit_id FROM report"""
            params = ()
        elif role[0][0] == 'Lead Auditor':
            query = """SELECT DISTINCT(audit_assignment.audit_id) FROM users 
            INNER JOIN audit_assignment ON audit_assignment.auditor = users.user_id WHERE users.created_by = %s"""
            params = (userid,)
        elif role[0][0] == 'AE':
            query = """SELECT audit_id FROM audit_assignment WHERE ae_userid = %s"""
            params = (userid,)
        elif role[0][0] == 'Auditor':
            return jsonify({'statusCode':300,'status':'This flow is not accessible to auditor'})
        audit_id = execute_query(query,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':404,'status':'audit_assignment data does not exist'})
        # mini = """SELECT status FROM report WHERE audit_id = %s"""
        # params = (audit_id[0][0],)
        # status = execute_query(mini,params,fetch=True)
        # if status is None:
        #     return jsonify({'statusCode':404,'status':'Data does not exist'})
        for i in audit_id:
            if i is not None:
                query1 = """SELECT audit_type_id FROM audit_assignment WHERE audit_id = %s"""
                params = (i[0],)
                audit_type_id = execute_query(query1,params,fetch=True)
                if audit_type_id != []:
                    query2 = """SELECT audit_assignment.stretch_name,audit_type.road_type,audit_type.stage,audit_assignment.audit_id,audit_assignment.status,audit_plan.audit_type AS audit_plan_type FROM audit_assignment
                    FULL JOIN audit_type ON audit_type.audit_type_id = audit_assignment.audit_type_id  
                    FULL JOIN audit_plan ON audit_type.audit_type_id = audit_plan.audit_type_id WHERE audit_type.audit_type_id = %s AND audit_assignment.status IN %s"""
                    params = (audit_type_id[0][0],get_status,)
                    stretch_details = execute_query(query2,params,fetch=True)
                    for j in stretch_details:
                        dict["audit_type_id"] = audit_type_id[0][0]
                        dict["stretch_name"] = j[0]
                        dict["road_type"] = j[1]
                        dict["stage"] = j[2]
                        dict["audit_id"] = j[3]
                        dict["status"] = j[4]
                        dict["audit_plan_Type"] = j[5]
                        if role[0][0] == "Auditor":
                            dict['status'] = i[1]
                        if j[3] not in dummy_list:
                            dummy_list.append(j[3])
                            dict_params.append(dict)
                        dict = {}
                        # dummy[audit_type_id[0][0]] = dict_params
        return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e: 
        return jsonify({'statusCode':500,'status':'Failed to update data'+str(e)})


@app.route('/view_report_file',methods=['GET','POST'])
def view_report_file(): 
    try:
        audit_id = request.json.get('audit_id')
        query = """SELECT report FROM report WHERE audit_id = %s"""
        params = (audit_id,)
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        else:    
            split = id[0][0].split('/')
            file_name = split[-1]
            query = """SELECT stretch_name FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,) 
            stretch = execute_query(query,params,fetch=True)
            zipfolder = ''
            report = "Report"
            check1 = parent_dir + "/" + report
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + stretch[0][0] 
            bool2 = os.path.exists(check2)
            check3 = check2 + "/" + audit_id
            bool3 = os.path.exists(check3)
            check4 = check3 + "/" + file_name
            bool4 = os.path.exists(check4)
            if check4:
                return send_file(id[0][0])
            else:
                response = jsonify({"statusCode":"404","status":"Report does not exist","message":"Report does not exist"})
                return response
    except Exception as e:
        return jsonify({"statusCode":"500","status":"Failed to fetch task details","message":"Failed to fetch task details"+str(e)})  

@app.route('/view_ae_report_file',methods=['GET','POST'])
def view_ae_report_file(): 
    try:
        audit_id = request.json.get('audit_id')
        query = """SELECT report FROM report WHERE audit_id = %s"""
        params = (audit_id,)
        id = execute_query(query,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        else:    
            split = id[0][0].split('/')
            file_name = split[-1]
            query = """SELECT stretch_name FROM audit_assignment WHERE audit_id = %s"""
            params = (audit_id,) 
            stretch = execute_query(query,params,fetch=True)
            zipfolder = ''
            report = "AE Report"
            check1 = parent_dir + "/" + report
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + stretch[0][0] 
            bool2 = os.path.exists(check2)
            check3 = check2 + "/" + audit_id
            bool3 = os.path.exists(check3)
            check4 = check3 + "/" + "AE Report"
            bool4 = os.path.exists(check4)
            if bool4 is False:
                return jsonify({'statusCode':404,'status':'AE report for this audit does not exist'})
            check5 = check4 + "/" + file_name
            bool5 = os.path.exists(check4)
            if check5:
                return send_file(id[0][0])
            else:
                response = jsonify({"statusCode":"404","status":"Report does not exist","message":"Report does not exist"})
                return response
    except Exception as e:
        return jsonify({"statusCode":"500","status":"Failed to fetch task details","message":"Failed to fetch task details"+str(e)})  

@app.route('/graph',methods=['GET','POST'])
def graph():
    try:
        userid = request.json.get('userid')
        road_owning_agency = request.json.get('road_owning_agency')
        state = request.json.get('state')
        type_of_audit = request.json.get('audit_type')
        name_of_audit = request.json.get('name_of_audit')
        assigned = {}
        auditor_list = []
        completed = {}
        filters = []
        params_list = []
        dummy = {}
        query = """SELECT role FROM users WHERE user_id = %s"""
        params = (userid,)
        role = execute_query(query,params,fetch=True)
        object = {
            "ap.road_owning_agency":road_owning_agency,
            "ap.state_name":state,
            "ap.audit_type":type_of_audit,
            "ap.stretch_name":name_of_audit
        }
        for i in object:
            if object[i] is not None and object[i] != "":
                where = "{i} = %s".format(i=i)
                filters.append(where)
                params_list.append(object[i])
        filter_clause = ""
        if filters:
            filter_clause = " AND " + " AND ".join(filters)
        if role == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        if role[0][0] == 'CoERS' or role[0][0] == 'Owner':
            # created_by = """SELECT user_id FROM users WHERE role = %s"""
            # params = ('Auditor',)
            # all_ids = execute_query(created_by,params,fetch=True)
            # if all_ids == []:
            #     return jsonify({'statusCode':500,'status':'Auditor data does not exist'})
            # for i in all_ids:
            #     auditor_list.append(i[0])
            # auditor_list = tuple(auditor_list)

            query1 = f"""
            SELECT COUNT(aa.audit_id),
                EXTRACT(MONTH FROM aa.start_date) AS month
            FROM audit_assignment aa
            INNER JOIN audit_plan ap
                ON ap.audit_type_id = aa.audit_type_id
            WHERE aa.status IN %s
            {filter_clause}
            GROUP BY month"""

            params = (('Assigned', 'Accepted', 'In Progress'), *params_list)
            data = execute_query(query1, params, fetch=True)

            query2 = f"""
            SELECT COUNT(aa.audit_id),
                EXTRACT(MONTH FROM aa.submitted_on) AS month
            FROM audit_assignment aa
            INNER JOIN audit_plan ap
                ON ap.audit_type_id = aa.audit_type_id
            WHERE aa.status IN %s
            {filter_clause}
            GROUP BY month"""
            params = (('Field Audit Completed', 'Report Submitted', 'Report Approved', 'Report Rejected'), *params_list)
            data2 = execute_query(query2, params, fetch=True)

            if data == []:
                assigned = {}
            else:
                for i in data:
                    assigned[i[0]] = i[1] 
            if data2 == []:
                completed = {}
            else:
                for i in data2:
                    if i[1] is not None:
                        completed[i[0]] = i[1]
            dummy['assigned'] = assigned
            dummy['completed'] = completed
            return jsonify({'statusCode':200,'status':"Success","details":dummy})
        elif role[0][0] == 'Lead Auditor':
            created_by = """SELECT user_id FROM users WHERE created_by = %s"""
            params = (userid,)
            all_ids = execute_query(created_by,params,fetch=True)
            if all_ids == []:
                return jsonify({'statusCode':500,'status':'Auditor data does not exist'})
            for i in all_ids:
                auditor_list.append(i[0])
            auditor_list = tuple(auditor_list)
            query1 = f"""
                    SELECT COUNT(aa.audit_id),
                        EXTRACT(MONTH FROM aa.start_date) AS month
                    FROM audit_assignment aa
                    INNER JOIN audit_plan ap
                        ON ap.audit_type_id = aa.audit_type_id
                    WHERE aa.auditor IN %s
                    AND aa.status IN %s
                    {filter_clause}
                    GROUP BY month
                    """
            params = (auditor_list,('Assigned', 'Accepted', 'In Progress'),*params_list)

            data = execute_query(query1, params, fetch=True)
            query2 = f"""
            SELECT COUNT(aa.audit_id),
                EXTRACT(MONTH FROM aa.submitted_on) AS month
            FROM audit_assignment aa
            INNER JOIN audit_plan ap
                ON ap.audit_type_id = aa.audit_type_id
            WHERE aa.auditor IN %s
            AND aa.status IN %s
            {filter_clause}
            GROUP BY month
            """
            params = (auditor_list,('Field Audit Completed', 'Report Submitted','Report Approved', 'Report Rejected'),*params_list)
            data2 = execute_query(query2, params, fetch=True)
            if data == []:
                assigned = {}
            else:
                for i in data:
                    assigned[i[0]] = i[1] 
            if data2 == []:
                completed = {}
            else:
                for i in data2:
                    if i[1] is not None:
                        completed[i[0]] = i[1]
            dummy['assigned'] = assigned
            dummy['completed'] = completed
            return jsonify({'statusCode':200,'status':"Success","details":dummy})
        elif role[0][0] == 'AE':
            # created_by = """SELECT user_id FROM users WHERE created_by = %s"""
            # params = (userid,)
            # all_ids = execute_query(created_by,params,fetch=True)
            # if all_ids == []:
            #     return jsonify({'statusCode':500,'status':'Auditor data does not exist'})
            # for i in all_ids:
            #     auditor_list.append(i[0])
            # auditor_list = tuple(auditor_list)
            query1 = f"""
                    SELECT COUNT(aa.audit_id),
                        EXTRACT(MONTH FROM aa.start_date) AS month
                    FROM audit_assignment aa
                    INNER JOIN audit_plan ap
                        ON ap.audit_type_id = aa.audit_type_id
                    WHERE aa.ae_userid = %s
                    AND aa.status IN %s
                    {filter_clause}
                    GROUP BY month
                    """     
            params = (userid,('Assigned', 'Accepted', 'In Progress'),*params_list)
            data = execute_query(query1, params, fetch=True)
            query2 = f"""
                    SELECT COUNT(aa.audit_id),
                           EXTRACT(MONTH FROM aa.submitted_on) AS month
                    FROM audit_assignment aa
                    INNER JOIN audit_plan ap
                        ON ap.audit_type_id = aa.audit_type_id
                    WHERE aa.ae_userid = %s
                      AND aa.status IN %s
                    {filter_clause}
                    GROUP BY month
                    """
            params = (userid,('Field Audit Completed', 'Report Submitted', 'Report Approved', 'Report Rejected'),*params_list)
            data2 = execute_query(query2, params, fetch=True)
            if data == []:
                assigned = {}
            else:
                for i in data:
                    assigned[i[0]] = i[1] 
            if data2 == []:
                completed = {}
            else:
                for i in data2:
                    if i[1] is not None:
                        completed[i[0]] = i[1]
            dummy['assigned'] = assigned
            dummy['completed'] = completed
            return jsonify({'statusCode':200,'status':"Success","details":dummy})
        elif role[0][0] == 'Auditor':
            query1 = """SELECT COUNT(audit_id),EXTRACT(month FROM start_date)
             AS month FROM audit_assignment WHERE auditor = %s AND status IN %s GROUP BY month"""
            params =(userid,('Assigned','Accepted','In Progress'),)
            data = execute_query(query1,params,fetch=True)
            query2 = """SELECT COUNT(audit_id),EXTRACT(month FROM submitted_on)
            AS month FROM audit_assignment WHERE auditor = %s AND status IN %s GROUP BY month"""
            params =(userid,('Field Audit Completed','Report Submitted','Report Approved','Report Rejected'),)
            data2 = execute_query(query2,params,fetch=True)
            if data == []:
                assigned = {}
            else:
                for i in data:
                    assigned[i[0]] = i[1] 
            if data2 == []:
                completed = {}
            else:
                for i in data2:
                    if i[1] is not None:
                        completed[i[0]] = i[1]
            dummy['assigned'] = assigned
            dummy['completed'] = completed
            return jsonify({'statusCode':200,'status':"Success","details":dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':"Failed to fetch data","message":'Failed to fetch graph details' + str(e)})

@app.route('/merge_report',methods=['GET','POST'])
def merge_report():
    try:
        audit_type_id = request.form.get('audit_type_id')
        report = request.form.get('report')
        file_name = request.form.get('file_name')
        total = request.files
        if (audit_type_id is None or audit_type_id == "") and (report is None or report == "") and (file_name is None or file_name == ""):
            return jsonify({'statusCode':400,'status':'Incomplete Details','message':'Please fill all details to merge report'}) 
        check = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id_check = execute_query(check,params,fetch=True)
        if id_check == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query = """SELECT report.audit_id,audit_assignment.stretch_name,report.status FROM report
        INNER JOIN audit_assignment ON report.audit_id = audit_assignment.audit_id WHERE audit_assignment.audit_type_id = %s """
        params = (audit_type_id,)
        data2 = execute_query(query,params,fetch=True)
        for i in data2:
            if i[2] != 'Report Submitted' and i[2] != 'Report Approved':
                status = '{audit} not submitted'.format(audit=i[0])
                return jsonify({'statusCode':400,'status':status})
        if file_name is not None:
            merged_report = 'Merged report'
            org_path = parent_dir + "/" + merged_report
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(data2[0][1]))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            # upload_path = os.path.join(user_path,str(file_name))
            file = total.get(file_name) 
            path1 = os.path.join(user_path,file_name)
            file.save(path1)
            query2 = """UPDATE audit_assignment SET merged_report = %s WHERE audit_type_id = %s"""
            params = (path1,audit_type_id,)
            execute_query(query2,params)
            return jsonify({'statusCode':200,'status':"Successfully merged report"})
        else:
            return jsonify
    except Exception as e:
        return jsonify({'statusCode':500,'status':"Failed to fetch data","message":'Failed to fetch details' + str(e)})

@app.route('/report_merger_old',methods=['GET','POST'])
def report_merger_old():
    try:
        audit_type_id = request.json.get('audit_type_id')
        dict = {}
        dummy = []
        check = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id_check = execute_query(check,params,fetch=True)
        if id_check == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query = """SELECT report.audit_id,audit_assignment.stretch_name,report.status FROM report
        INNER JOIN audit_assignment ON report.audit_id = audit_assignment.audit_id WHERE audit_assignment.audit_type_id = %s """
        params = (audit_type_id,)
        data2 = execute_query(query,params,fetch=True)
        if data2 == []:
            return jsonify({'statusCode':500,'status':'Data does not exist'})
        # for i in data2:
        #     if i[2] != 'Submitted':
        #         status = '{audit} not submitted'.format(audit=i[0])
        #         return jsonify({'statusCode':400,'status':status})
        for i in data2:
            query2 = """SELECT background_details FROM report WHERE audit_id = %s"""
            params = (i[0],)
            details = execute_query(query2,params,fetch=True)
            if details == []:
                return jsonify({'statusCode':500,'status':'Data does not exist'})
            actual = details[0][0]
            dummy.append(actual)
        # for dicts in dummy:
        #     for key,value in dicts.items():
        #         dict[key] = dict.get(key,'') + str(value)
        return jsonify({'statusCode':200,'status':"Successfully merged report",'details': dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':"Failed to fetch data","message":'Failed to fetch details' + str(e)})  

@app.route('/report_merger',methods=['GET','POST'])
def report_merger():
    try:
        audit_type_id = request.json.get('audit_type_id')
        dict = {}
        dummy = []
        extra = []
        empty = []
        check = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id_check = execute_query(check,params,fetch=True)
        if id_check == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query = """SELECT report.audit_id,audit_assignment.stretch_name,report.status FROM report
        INNER JOIN audit_assignment ON report.audit_id = audit_assignment.audit_id WHERE audit_assignment.audit_type_id = %s """
        params = (audit_type_id,)
        data2 = execute_query(query,params,fetch=True)
        if data2 == []:
            return jsonify({'statusCode':500,'status':'Data does not exist'})
        # for i in data2:
        #     if i[2] != 'Submitted':
        #         status = '{audit} not submitted'.format(audit=i[0])
        #         return jsonify({'statusCode':400,'status':status})
       
        # for i in data2:
        #     query2 = """SELECT background_details FROM report WHERE audit_id = %s"""
        #     params = (i[0],)
        #     details = execute_query(query2,params,fetch=True)
        #     if details == []:
        #         return jsonify({'statusCode':500,'status':'Data does not exist'})
        #     actual = details[0][0]
        #     dummy.append(actual)
 
        # for dicts in dummy:
        #     for key,value in dicts.items():
        #         dict[key] = dict.get(key,'') + str(value)
        for i in data2:
            if i[0] not in empty:
                empty.append(i[0])
        empty = tuple(empty)
        query = """SELECT background_details FROM report WHERE audit_id in {}""".format(empty)
        conn = connect(DB_CONFIG)
        dfs = postgresql_to_dataframe(conn,query, ["background_details"])
        res = dfs["background_details"].to_dict()
        return jsonify({'statusCode':200,'status':"Successfully merged report",'details': res})
    except Exception as e:
        return jsonify({'statusCode':500,'status':"Failed to fetch data","message":'Failed to fetch details' + str(e)}) 


@app.route('/view_merged_report',methods=['GET','POST'])
def view_merged_report():
    try:
        audit_type_id = request.json.get('audit_type_id')
        query = """SELECT merged_report FROM audit_assignment WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        report_path = execute_query(query,params,fetch=True)
        file_list = report_path[0][0].split('/')
        file_name = file_list[-1]
        query1 = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        id = execute_query(query1,params,fetch=True)
        if id == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        else:
            query2 = """SELECT stretch_name FROM audit_type WHERE audit_type_id = %s"""
            params = (audit_type_id,)
            stretch = execute_query(query2,params,fetch=True)
            zipfolder = ''
            report = "Merged report"
            check1 = parent_dir + "/" + report
            bool1 = os.path.exists(check1)
            check2 = check1 + "/" + stretch[0][0] 
            bool2 = os.path.exists(check2)
            # check3 = check2 + "/" + file_name
            # bool3 = os.path.exists(check3)    
            if bool1 is True and bool2 is True: 
                    archived = shutil.make_archive(check2,  'zip',check2)
                    zipfolder = check2 + ".zip"
                    bool2 = os.path.exists(zipfolder)
                    if bool2 == True:
                        return send_file(report_path[0][0])
                    else:
                        response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                        return response
            else:
                response = jsonify({"statusCode":"404","status":"Report does not exist","message":"Report does not exist"})
                return response
    except Exception as e:
        return jsonify({"statusCode":"100","status":"Failed to fetch task details","message":"Failed to fetch task details"+str(e)})

@app.route('/general_observation_merged',methods=['GET','POST'])
def general_observation_merged():   
    try:
        audit_type_id = request.json.get('audit_type_id')
        extra = {}
        dummy = {}
        if audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check ="""SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        audit_id = execute_query(check,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':500,'status':'audit_id data does not exist'})
        for a in audit_id:
            query = """SELECT DISTINCT(roadside) FROM answer_auditwise WHERE audit_id = %s AND general_obs = %s"""
            params = (a[0],True,)
            road_side = execute_query(query,params,fetch=True)
            if road_side == []:
                return jsonify({'statusCode':500,'status':'roadside data does not exist'})
            query3 = """SELECT answer_auditwise.s_no,chainage,answer_auditwise.gps_location,
            answer_auditwise.issues,question_bank.section,answer_auditwise.section_count,answer_auditwise.roadside,answer_auditwise FROM answer_auditwise
            INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id WHERE answer_auditwise.audit_id = %s
            AND answer_auditwise.general_obs = %s"""
            params = (a[0],True,)
            data= execute_query(query3,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':500,'status':'general observation details data does not exist'})
            for i in data:
                dummy = {}
                if i[3] is not None and i[3] != "" and i[3] != []:
                    issues = list(i[3].values())
                else:
                    issues = None
                section = i[4] if i[4] is not None else "None"
                chainage = i[1] if i[1] is not None else None
                s_no = i[0] if i[0] is not None else None
                gps_location = i[2] if i[2] is not None else None
                section_count = i[5] if i[5] is not None else None
                roadside = i[6] if i[6] else "None" 
                audit_id = i[7]

                dummy['section'] = section
                dummy['chainage'] = chainage
                dummy['s_no'] = s_no
                dummy['gps_location'] = gps_location
                dummy['issues'] = issues
                dummy['section_count'] = section_count
                dummy['roadside'] = roadside
                dummy['audit_id'] = audit_id

                if section not in extra:
                    extra[section] = {}
                if roadside not in extra[section]:
                    extra[section][roadside] = []
                extra[section][roadside].append(dummy)
        return jsonify({'statusCode':200,'status':"Success",'details':extra})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/critical_observation_merged',methods=['GET','POST'])
def critical_observation_merged():
    try:
        audit_type_id = request.json.get('audit_type_id')
        final_list = []
        dict =  {}
        dummy= {}
        store = {}
        if audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check ="""SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type_id'})
        query0 = """SELECT audit_id FROM audit_assignment WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        audit_id = execute_query(query0,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':500,'status':'Data does not exist'})
        for a in audit_id:
            query = """SELECT DISTINCT(roadside) FROM answer_auditwise WHERE audit_id = %s AND critical_obs = %s"""
            params = (a[0],True,)
            road_side = execute_query(query,params,fetch=True)
            if road_side == []:
                return jsonify({'statusCode':500,'status':'Data does not exist'})
            query = """SELECT answer_auditwise.section_id,question_bank.section,answer_auditwise.section_count,answer_auditwise.q_id,answer_auditwise.answer,answer_auditwise.issues,
                question_bank.conditions,question_bank.field_type,question_bank.functionality,question_bank.irc_help_tool,question_bank.master_table,question_bank.questions,
                answer_auditwise.issues,question_bank.data_type,answer_auditwise.general_obs,answer_auditwise.critical_obs,answer_auditwise.roadside,answer_auditwise.new_issue,
                 answer_auditwise.new_suggestion,answer_auditwise.audit_id FROM answer_auditwise INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id
                where answer_auditwise.audit_id = %s AND answer_auditwise.section_id NOT IN %s"""
        params = (a[0],('A','B'),)
        data = execute_query(query,params,fetch=True)
        for i in data:
            section = i[1]
            section_count = i[2]
            dummy['answer'] = i[4]
            dummy['roadside'] = i[16]
            dummy['conditions'] = i[6]
            dummy['data_type'] = i[13]
            dummy['field_type'] = i[7]
            dummy['functionality'] = i[8]
            dummy['irc_help_tool'] = i[9]
            dummy['master_table'] = i[10]
            dummy['question'] = i[11]
            dummy['question_id'] = i[3]
            dummy['retrieval_id'] = list(i[12].values()) if i[12] is not None else []
            dummy['section'] = i[1]
            dummy['section_count'] = i[2]
            dummy['section_id'] = i[0]
            dummy['general_observation'] = i[14]
            dummy['critical_observation'] = i[15]
            dummy['new_issue'] = i[17]
            dummy['new_suggestion'] = i[18]
            dummy['audit_id'] = i[19]
            if section not in store:
                store[section] = {}
            if section_count not in store[section]:
                store[section][section_count] = []
            store[section][section_count].append(dummy)
            dummy = {}
        return jsonify({'statusCode':200,'status':"Success",'details':store})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/ae_dropdown',methods=['GET','POST'])
def ae_dropdown():
    try:
        userid = request.json.get('userid')
        dummy_dict = {}
        dummy = []
        query = """SELECT role FROM users WHERE user_id = %s"""
        params = (userid,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if data[0][0] != "Auditor":
            query1 = """SELECT user_id, CONCAT  (first_name, ' ', last_name) AS "Full name" FROM users WHERE role = %s"""
            params = ("AE",)
            ae = execute_query(query1,params,fetch=True)
            if ae == []:
                return jsonify({'statusCode':404,'status':'Auditor data does not exist'}) 
            for i in ae:
                dummy_dict['userid'] = i[0]
                dummy_dict['name'] = i[1]
                dummy.append(dummy_dict)
                dummy_dict = {}
        return jsonify({'statusCode':200,'status':"Success",'details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/auditor_dd',methods=['GET','POST'])
def auditor_dd():
    try:
        userid = request.json.get('userid')
        dummy_dict = {}
        dummy = []
        query = """SELECT role FROM users WHERE user_id = %s"""
        params = (userid,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if data[0][0] == 'CoERS' or data[0][0] == 'Owner':
            query1 = """SELECT user_id, CONCAT  (first_name, ' ', last_name) AS "Full name" FROM users WHERE role = %s"""
            params = ('Auditor',)
            users = execute_query(query1,params,fetch=True)
            if users == []:
                return jsonify({'statusCode':500,'status':'Auditor data does not exist'})
            for i in users:
                dummy_dict['userid'] = i[0]
                dummy_dict['name'] = i[1]
                dummy.append(dummy_dict)
                dummy_dict = {}
        elif data[0][0] == 'Lead Auditor':
            query1 = """SELECT user_id, CONCAT  (first_name, ' ', last_name) AS "Full name" FROM users WHERE created_by = %s"""
            params = (userid,)
            users = execute_query(query1,params,fetch=True)
            if users == []:
                return jsonify({'statusCode':500,'status':'Auditor data does not exist'})
            for i in users:
                dummy_dict['userid'] = i[0]
                dummy_dict['name'] = i[1]
                dummy.append(dummy_dict)
                dummy_dict = {}
        else:
            status = 'forbidden access:{role}'.format(role=data[0][0])
            return jsonify({'statusCode':403,'status':status})
        return jsonify({'statusCode':200,'status':"Success",'details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/display_conditions',methods=['GET','POST'])
def display_conditions():
    try:
        road_type_id = request.json.get('road_type_id')
        stage_id = request.json.get('stage_id')
        section_id = request.json.get('section_id')
        qid = request.json.get('qid')
        dummy = []
        sections = []
        stages = []
        roads = []
        qids = []
        if  road_type_id is None or road_type_id == "" or stage_id == "" or section_id is None or section_id == "" or qid == "" or qid is None:
            return jsonify({'statusCode':400,'status':'Incomplete Details','message':'Please fill all details to register'})
        check_sec = """SELECT DISTINCT(section_id) FROM question_bank"""
        params = ()
        fetch = execute_query(check_sec,params,fetch=True)
        check_stg = """SELECT DISTINCT(stage_id) FROM question_bank"""
        params = ()
        fetch2 = execute_query(check_stg,params,fetch=True)
        if fetch2 == []:
            return jsonify({'statusCode':500,'status':'Auditor data does not exist'})
        check_road = """SELECT DISTINCT(road_type_id) FROM question_bank"""
        params = ()
        fetch3 = execute_query(check_road,params,fetch=True)
        if fetch3 == []:
            return jsonify({'statusCode':500,'status':'road_type_id data does not exist'})
        for i in fetch:
            sections.append(i[0])
        for i in fetch2:
            stages.append(i[0])
        for i in fetch3:
            roads.append(i[0])
        if section_id not in sections:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        if stage_id not in stages:
            return jsonify({'statusCode':400,'status':'Invalid stage_id'})
        if road_type_id not in roads:
            return jsonify({'statusCode':400,'status':'Invalid road_type_id'})
        query0 = """SELECT q_id FROM question_bank WHERE q_id = %s"""
        params = (qid,)
        data0 = execute_query(query0,params,fetch=True)
        if data0 == []:
            return jsonify({'statusCode':400,'status':'Invalid qid'})
        query = """SELECT q_id FROM question_bank WHERE section_id = %s AND road_type_id = %s AND stage_id = %s"""
        params = (section_id,road_type_id,stage_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':500,'status':'q_id data does not exist'})
        for i in data:
            dummy.append(i[0])
            dummy.sort()
        qno = qid[6]
        for i in dummy:
            values = i.split('.')
            if int(values[3]) < int(qno):
                qids.append(i)
        return jsonify({'statusCode':200,'status':"Success",'details':qids})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/new_dependency',methods=['GET','POST'])
def new_dependency():
    try:
        q_id = request.json.get('q_id')
        dummy = []
        questions = []
        if q_id is None or q_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete Details','message':'Please fill all details to register'})
        check = """SELECT DISTINCT(q_id) FROM question_bank"""
        params = ()
        fetch = execute_query(check,params,fetch=True)
        if fetch == []:
            return jsonify({'statusCode':500,'status':'q_id data does not exist'})
        for i in fetch:
            questions.append(i[0])
        if q_id not in questions:
            return jsonify({'statusCode':400,'status':'Invalid q_id'})
        query = """SELECT DISTINCT(dependency_dd) FROM master_table WHERE q_id = %s"""
        params = (q_id,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':500,'status':'dependency_dd data does not exist'})
        if data[0][0] == 'NA':
            query1 = """SELECT master_table FROM master_table WHERE q_id = %s"""
            params = (q_id,)
            data1 = execute_query(query1,params,fetch=True)
            for i in data1:
                dummy.append(i[0])
        return jsonify({'statusCode':200,'status':"Success",'details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/get_password',methods=['GET','POST'])
def get_password():
    try:
        dummy = {}
        userid = request.json.get('userid')
        query = """SELECT user_id,password FROM users WHERE user_id = %s"""
        params = (userid,)
        data = execute_query(query,params,fetch=True)
        for i in data:
            dummy[i[0]] = i[1] 
        return jsonify({'statusCode':200,'status':"Success",'details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})
    
@app.route('/location_capture',methods=['GET','POST'])
def location_capture():
    try:
        audit_id = request.form.get('audit_id')
        filename = request.form.get('filename')
        total = request.files
        file_save = []
        if audit_id is None or audit_id == "" or filename is None or filename == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(query,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        filename = json.loads(filename)
        location = 'Location Capture'
        if type(filename) != list:
            return jsonify({'statusCode':400,'status':'Invalid input type for filename'})
        for i in filename: 
            org_path = parent_dir + "/" + str(location)
            bool1 = os.path.exists(org_path)
            if bool1 is False:
                os.makedirs(org_path)
            user_path = os.path.join(org_path,str(audit_id))
            bool2 = os.path.exists(user_path)
            if bool2 is False:
                os.makedirs(user_path)
            upload_path = os.path.join(user_path,str(i))
            file = total.get(i)
            path = upload_path
            file.save(path)
            file_save.append(path)
        return jsonify({'statusCode':200,'status':'Successfully stored location capture details'})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch kml file","message":"Unable to fetch kml file" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/location_capture_get',methods = ['GET','POST'])
def location_capture_get():
    try:
        audit_id = request.json.get('audit_id')
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete details please fill the data'})
        query = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(query,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        zipfolder = ''
        location = "Location Capture"
        check1 = parent_dir + "/" + location
        bool1 = os.path.exists(check1)
        check2 = check1 + "/" + str(audit_id)
        bool2 = os.path.exists(check2)
        if bool1 is True and bool2 is True:
                archived = shutil.make_archive(check2, 'zip', check2)
                zipfolder = check2 + ".zip"
                bool3 = os.path.exists(zipfolder)
                if bool3 == True:
                    return send_file(zipfolder,mimetype = 'zip',as_attachment = True)
                else:
                    response = jsonify({"statusCode":"400","status":"ZIP file not created","message":"ZIP file not created"})
                    return response
        else:
            response = jsonify({"statusCode":"404","status":"No such files exist","message":"No such files exist"})
            return response
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Unable to fetch images","message":"Unable to fetch images" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/total_stretch_kml',methods=['GET','POST'])
def total_stretch_kml():
    try:
        audit_type_id = request.json.get('audit_type_id')
        dummy = {}
        locations_list = []
        if audit_type_id is None or audit_type_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check = """SELECT audit_type_id FROM audit_type WHERE audit_type_id = %s"""
        params = (audit_type_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        basic_query = """SELECT DISTINCT(geojson_total_stretch.audit_type_id),geojson_total_stretch.stretch_name,
        ST_AsGeoJSON(geojson_total_stretch.geometry),geojson_total_stretch."Description",geojson_total_stretch."Name" FROM geojson_total_stretch
            INNER JOIN audit_plan ON geojson_total_stretch.audit_type_id = audit_plan.audit_type_id
			INNER JOIN audit_assignment ON geojson_total_stretch.audit_type_id = audit_assignment.audit_type_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE audit_assignment.audit_type_id = %s"""
        params = (audit_type_id,)
        data = execute_query(basic_query,params,fetch=True)
        for location in data:
            dummy["audit_type_id"] = location[0]
            dummy["stretch_name"] = location[1]
            dummy["geometry"] = json.loads(location[2])
            dummy["description"] = location[3]
            dummy["chainage"] = location[4]
            dummy["type"] = "Feature"
            locations_list.append(dummy)
            dummy = {}
        return jsonify({'statusCode':200,'status':'Success','location':locations_list})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response

@app.route('/auditor_stretch_kml',methods=['GET','POST'])
def auditor_stretch_kml():
    try:
        audit_id = request.json.get('audit_id')
        dummy = {}
        locations_list = []
        if audit_id is None or audit_id == "":
            return jsonify({'statusCode':400,'status':'Incomplete data please fill all the details'})
        check = """SELECT audit_id FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        verify = execute_query(check,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        basic_query = """SELECT DISTINCT(geojson_audit_stretch.audit_id),geojson_audit_stretch.stretch_name,
            ST_AsGeoJSON(geojson_audit_stretch.geometry),geojson_audit_stretch."Description",geojson_audit_stretch."Name" FROM geojson_audit_stretch
			INNER JOIN audit_assignment ON geojson_audit_stretch.audit_id = audit_assignment.audit_id
            INNER JOIN users ON audit_assignment.auditor = users.user_id WHERE audit_assignment.audit_id = %s"""
        params = (audit_id,)
        data = execute_query(basic_query,params,fetch=True)
        for location in data:
            dummy["audit_id"] = location[0]
            dummy["stretch_name"] = location[1]
            dummy["geometry"] = json.loads(location[2])
            dummy["description"] = location[3]
            dummy["chainage"] = location[4]
            dummy["type"] = "Feature"
            locations_list.append(dummy)
            dummy = {}
        return jsonify({'statusCode':200,'status':'Success','location':locations_list})
    except Exception as e:
        response = jsonify({"statusCode":"500","status":"Failed to fetch data","message":"Failed to fetch data" + str(e)})                                                                                                                                                                                    
        return response     

@app.route('/suggestion_mapping_images', methods=['GET', 'POST'])
def suggestion_mapping_images():
    try:
        audit_id = request.json.get('audit_id')
        if not audit_id:
            return jsonify({'statusCode': 400, 'status': 'Incomplete Details', 'message': 'Please provide audit_id'})
        check_query = "SELECT audit_id FROM audit_assignment WHERE audit_id = %s"
        params = (audit_id,)
        if not execute_query(check_query,params, fetch=True):
            return jsonify({'statusCode': 400, 'status': 'Invalid audit_id'})
        query = "SELECT retrieval_ids FROM answer_auditwise WHERE audit_id = %s"
        params = (audit_id,)
        data = execute_query(query,params,fetch=True)
        folder_names = []
        for row in data:
            if row[0] is not None:
                if type(row[0]) == list:
                    folder_names.extend(row[0])
                else:
                    folder_names.append(row[0])
        if not folder_names:
            return jsonify({'statusCode': 404, 'status': 'No folders found', 'message': 'No retrieval_ids found for this audit'})
        source_base = os.path.join(parent_dir, "Suggestion Mapping")
        temp_dir = os.path.join(parent_dir,f"suggestion_mapping_{audit_id}")
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)
        for folder in folder_names:
            source_folder = os.path.join(source_base, folder)
            target_folder = os.path.join(temp_dir,folder) 
            if os.path.exists(source_folder):
                shutil.copytree(source_folder, target_folder, dirs_exist_ok=True)
        zip_path = shutil.make_archive(temp_dir, 'zip', temp_dir)
        zip_file_name = os.path.basename(zip_path)
        if os.path.exists(zip_path):
            return send_file(zip_path, mimetype='application/zip', as_attachment=True, download_name=zip_file_name)
        else:
            return jsonify({"statusCode": 102, "status": "ZIP file not created", "message": "ZIP file not created"})
    except Exception as e:
        return jsonify({"statusCode": 500, "status": "Internal server error", "message": str(e)})

@app.route("/convert", methods=["POST", "GET"])
def convert():
        base_folder_path = request.form.get("path")
        if not base_folder_path:
            return "Please provide a valid 'path' in the payload."

        if not os.path.exists(base_folder_path):
            return f"Base folder at {base_folder_path} not found."

        format = request.form.get("format").lower()

        # if format not in ['png', 'jpg', 'jpeg', 'gif', 'bmp']:
        #     print(format,'fo')
        #     return "Invalid format. Supported formats are: png, jpg, jpeg, gif, bmp."

        image_urls = []
        for subfolder in os.listdir(base_folder_path):
            subfolder_path = os.path.join(base_folder_path, subfolder)
            if os.path.isdir(subfolder_path):
                new_folder = f"{subfolder_path}_new"
                os.makedirs(new_folder, exist_ok=True) 
                for image_file in os.listdir(subfolder_path):
                        input_image_path = os.path.join(subfolder_path, image_file)
                        
                        output_image_filename = os.path.splitext(image_file)[0] + "." + format
                        output_image_path = os.path.join(new_folder, output_image_filename)
                        
                        with Image.open(input_image_path) as image:
                            image.convert('RGB').save(output_image_path)
                        
                        filepath = 'images/' + os.path.relpath(output_image_path, new_folder)
                        image_url = url_for('static', filename=filepath)
                        image_urls.append(image_url)
        return {'image_urls': image_urls}

@app.route('/duplicate',methods=['GET','POST'])
def duplicate():
    try:
        user_id = request.json.get('user_id')
        audit_id = request.json.get('audit_id')
        section_id = request.json.get('section_id')
        check_count = set()
        dummy = {}
        dummy_list = []

        validation = ["user_id","audit_id","section_id"]
        check = json_validate(validation) 
        if check != {}:
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statusCode":400,"status":status})
        check = """SELECT user_id,role FROM users WHERE  user_id = %s"""
        params = (user_id,)
        data = execute_query(check,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        # if data[0][1] != "Auditor":
        #     return jsonify({'statusCode':400,'status':'Forbidden Access'})
        query2 = """SELECT audit_id,auditor FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        data2 = execute_query(query2,params,fetch=True)
        print(data2[0][1])
        if data2 == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_id'})
        # if data2[0][1] != user_id:
        #     return jsonify({'statusCode':400,'status':'Forbidden Access'})
   
        query3 = """SELECT DISTINCT(section_id) FROM answer_auditwise WHERE audit_id = %s AND section_id = %s"""
        params = (audit_id,section_id,)
        data3 = execute_query(query3,params,fetch=True)
        if data3 == []:
            return jsonify({'statusCode':400,'status':'Invalid section_id'})
        query4 = """SELECT answer_auditwise.section_id,question_bank.section,answer_auditwise.section_count,answer_auditwise.q_id,answer_auditwise.answer,answer_auditwise.issues,
                question_bank.conditions,question_bank.field_type,question_bank.functionality,question_bank.irc_help_tool,question_bank.master_table,question_bank.questions,
                answer_auditwise.issues,question_bank.data_type,answer_auditwise.general_obs,answer_auditwise.critical_obs,answer_auditwise.roadside,answer_auditwise.new_issue
                ,answer_auditwise.new_suggestion FROM answer_auditwise INNER JOIN question_bank ON answer_auditwise.q_id = question_bank.q_id
                where answer_auditwise.audit_id = %s AND answer_auditwise.section_id = %s"""
        params = (audit_id,section_id,)
        data4 = execute_query(query4,params,fetch=True)
        query = """SELECT MAX(section_count) FROM answer_auditwise WHERE audit_id = %s AND section_id = %s"""
        params = (audit_id,section_id,)
        data5 = execute_query(query,params,fetch=True)
        for i in data4:
            dummy = {}
            section = i[1]
            section_count = i[2]
            dummy['answer'] = i[4]
            dummy['roadside'] = i[16]
            dummy['conditions'] = i[6]
            dummy['data_type'] = i[13]
            dummy['field_type'] = i[7]
            dummy['functionality'] = i[8]
            dummy['irc_help_tool'] = i[9]
            dummy['master_table'] = i[10]
            dummy['question'] = i[11]
            dummy['question_id'] = i[3]
            dummy['retrieval_id'] = list(dict(i[12]).values()) if i[12] is not None else []
            dummy['section'] = i[1]
            dummy['section_count'] = i[2]
            dummy['section_id'] = i[0]
            dummy['general_observation'] = i[14]
            dummy['critical_observation'] = i[15]
            dummy['new_issue'] = i[17]
            dummy['new_suggestion'] = i[18]
            dummy_list.append(dummy)
            check_count.add(section_count)
        return jsonify({"statusCode":200,"status":"Successfully fetched previous data","details":dummy_list,"max_count":data5[0][0]})
    except Exception as e:
        return jsonify({"statusCode": 500, "status": "Internal server error", "message": str(e)})

@app.route('/ae_report_approval',methods=['GET','POST'])
def ae_report_approval():
    try:
        audit_id = request.form.get('audit_id')
        userid = request.form.get('userid')
        filename = request.form.get('filename')
        total = request.files
        validation = ['audit_id','userid','filename']
        check = validate(validation)
        if check != {}:
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statuscode":400,"status":status})   
        query0 = """SELECT audit_id,stretch_name FROM audit_assignment WHERE audit_id = %s"""
        params = (audit_id,)
        data = execute_query(query0,params,fetch=True)
        query1 = """SELECT user_id,role FROM users WHERE user_id = %s"""
        params = (userid,)
        data1 = execute_query(query1,params,fetch=True)
        if data1 == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if data1[0][1] != 'AE':
            return jsonify({'statusCode':403,'status':'Forbidden Access'})
        report = "Report"
        org_path = parent_dir + "/" + report
        bool1 = os.path.exists(org_path)
        if bool1 is False:
            os.makedirs(org_path)
        user_path = os.path.join(org_path,str(data[0][1]))
        bool2 = os.path.exists(user_path)
        if bool2 is False:
            os.makedirs(user_path)
        audit_path = os.path.join(user_path,str(audit_id))
        bool2 = os.path.exists(audit_path)
        if bool2 is False:
            os.makedirs(audit_path)   
        ae_path = 'AE Report'
        ae = os.path.join(audit_path,ae_path)
        bool3 = os.path.exists(ae)
        if bool3 is False:
            os.makedirs(ae)
        file = total.get(filename)
        path = ae+"/"+filename
        file.save(path)
        query2 = """UPDATE report SET ae_report = %s WHERE audit_id = %s"""
        params = (path,audit_id,)
        execute_query(query2,params)
        return jsonify({"statusCode":200,"status":"Successfully submitted report"})
    except Exception as e:
        return jsonify({"statusCode": 500, "status": "Internal server error", "message": str(e)})

@app.route('/audit_name_dd',methods=['GET','POST'])
def audit_name_dd():
    try:
        audit_type = request.json.get('audit_type')
        validation = ["audit_type"]
        check = json_validate(validation)
        if check != {}: 
            status = "Incomplete data please fill all these details:{check}".format(check=check)
            return jsonify({"statusCode":400,"status":status})
        dummy = []
        query = """SELECT audit_type from dropdown_values WHERE audit_type = %s"""
        params = (audit_type,)
        verify = execute_query(query,params,fetch=True)
        if verify == []:
            return jsonify({'statusCode':400,'status':'Invalid audit_type'})
        query2 = """SELECT DISTINCT(stretch_name) FROM audit_plan WHERE audit_type = %s"""
        params = (audit_type,)
        data = execute_query(query2,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':404,'status':'Data does not exist'})
        for i in data:
            dummy.append(i[0])
        response = jsonify({"statusCode":200,"status":"Stretch names fetched successfully","details":dummy})
        return response
    except Exception as e:
        return jsonify({"statusCode":"500","status":"Failed to fetch task details","message":"Failed to fetch task details"+str(e)})  

@app.route('/field_user_dd',methods=['GET','POST'])
def field_user_dd():
    try:
        userid = request.json.get('userid')
        dummy_dict = {}
        dummy = []
        query = """SELECT role FROM users WHERE user_id = %s"""
        params = (userid,)
        data = execute_query(query,params,fetch=True)
        if data == []:
            return jsonify({'statusCode':400,'status':'Invalid userid'})
        if data == 'Auditor':
            status = 'forbidden access:{role}'.format(role=data[0][0])
            return jsonify({'statusCode':403,'status':status})
        query = """SELECT user_id AS userid,first_name AS name FROM users WHERE role = %s"""
        params = ('Field User',)
        data = execute_dict_query(query,params,fetch=True)
        if data == []:
            return jsonify({'status_code':404,'status':'Data does not exist'})
        for i in data:
            dummy.append(i)
        return jsonify({'statusCode':200,'status':"Success",'details':dummy})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Internal server error'+str(e)})

@app.route('/field_user_dashboard',methods= ['GET','POST'])
def field_user_dashboard():           
    try:
        user_id = request.json.get('user_id')
        dict = {}
        dict_params = []
        chck = """SELECT user_id FROM users WHERE user_id = %s"""
        params = (user_id,)
        verify1 = execute_query(chck,params,fetch=True)
        if verify1 == []:
            return jsonify({'statusCode':400,'status':'Invalid user_id'})
        query = """SELECT audit_id FROM audit_assignment WHERE field_user = %s"""
        params = (user_id,)
        audit_id = execute_query(query,params,fetch=True)
        if audit_id == []:
            return jsonify({'statusCode':404,'status':'Data does not exist'})
        else:
            verify = """SELECT role FROM users WHERE user_id = %s"""
            params = (user_id,)
            role = execute_query(verify,params,fetch=True)
            if role[0][0] != 'Field User':
                return jsonify({'statusCode':105,'status':'Invalid Field User'})
            query = """SELECT aa.audit_type_id,aa.stretch_name,aa.start_date,aa.submit_date,aa.auditor,aa.type_of_audit,aa.audit_plan_id,aa.audit_id
                    ,aa.created_by,aa.status,aa.auditor_stretch,aa.auditor,state_name,ap.district_name,ap.name_of_road,ap.road_number,ap.no_of_lanes,
                    ap.road_owning_agency,ap.chainage_start,ap.chainage_end,ap.location_start,ap.location_end,ap.latitude_start,ap.latitude_end,
                    ap.stretch_length,aa.field_user,aa.auditor FROM audit_assignment aa INNER JOIN audit_plan ap ON ap.audit_plan_id = aa.audit_plan_id WHERE 
                    aa.field_user = %s"""
            params = (user_id,)
            data = execute_dict_query(query,params,fetch=True)
            if data == []:
                return jsonify({'statusCode':404,'status':'Data does not exist'})
            for i in data:
                dict_params.append(i)
            return jsonify({'statusCode':200,'status':'Success','details':dict_params})
    except Exception as e:
        return jsonify({'statusCode':500,'status':'Failed to fetch data'+str(e)})


# if __name__ == '__main__':    
#     app.run(host="0.0.0.0",port=5000,debug=True)

