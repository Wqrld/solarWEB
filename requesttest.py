import requests

x = requests.post('https://novumzon.wqrld.net/newdata', json={"apikey": "", "wattAC": 5})
print(x.text)
y = requests.post('https://novumzon.wqrld.net/uploadimage', files={'plot': open('readme.md' ,'rb')})
print(y.text)