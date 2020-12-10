#!/usr/bin/python3
import serial

ser = serial.Serial(port= '/dev/ttyUSB0', timeout= 5)  # open serial port

ser.write(bytes.fromhex("C0 05 FF FF B6 00 00 00 79")) #stuur een B6 request naar adres C0 05 om alle data op te halen

reading = ser.read(62) #lees 62 bytes

subreading = reading[8:62] #haal de header ervanaf, die hebben we niet nodig
reading1 = subreading[0:23] #de omvormer bestaat als het ware als twee losse omvormers die beiden hun data na elkaar sturen, deze kan je optellen.
reading2 = subreading[31:59] #sla weer een paar bytes over, en pak de data van het tweede onderdeel

if reading[2] == 255: #De omvormer geeft alleen maal FF (255) bytes als er iets fout gaat, doe niks als dit zo is. 
  print("error")
else:
  print(reading.hex()) #print de data naar je console

# DC stroom, samengevat:

# reading1[0:2] pakt bytes 1 en 2, arrays beginnen bij 0 en het laatste cijfer geeft aan welke waarde niet meer meegetelt moet worden
# int.from_bytes(reading1[0:2], "little") verandert die bytes naar een integer, hij gebruikt hiervoor de little endian encoding (rechter byte komt voorop)
# Je leest eerst het voltage uit van byte 1 en 2. Die vermenigvuldig je met de stroom van byte 3 en 4. 
# De stroom moet je eerst nog door 2 delen omdat deze voor precisie keer honderd gedaan is
# als laatste tel je de waardes van beide sub omvormers bij elkaar op en rond je deze af
  Pdc = str(round(int.from_bytes(reading1[0:2], "little") * int.from_bytes(reading1[2:4], "little") / 100 +
      int.from_bytes(reading2[0:2], "little") * int.from_bytes(reading2[2:4], "little") / 100, 2)) # V * A / 100

#voor de andere waarden is het makkelijker, de output stroom 
  Iac = str(int.from_bytes(reading[10:12], "little") + int.from_bytes(reading2[10:12], "little")) #Wisselstroom 
  wtot1 = int.from_bytes(reading[20:23], "little") / 100 # totaal aantal watt op omvormer 1
  wtot2 = int.from_bytes(reading[51:54], "little") / 100 # totaal aantal watt op omvormer 2

 cursor.execute('insert into readings values("' +
  str(datetime.datetime.now().date()) + '","' +
  str(datetime.datetime.now().strftime('%H:%M')) +
  '","' + dc + '","' + ac + '")')