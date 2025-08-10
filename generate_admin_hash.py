import bcrypt

# Ganti password admin di sini
admin_password = input('Masukkan password admin: ').encode('utf-8')
hashed = bcrypt.hashpw(admin_password, bcrypt.gensalt())
print('Password hash admin (copy ke SQL):')
print(hashed.decode())
