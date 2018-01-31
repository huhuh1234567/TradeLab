arr = UInt8[1,3,5,2,4,6]
fd = open("E:\\test\\temp0130.bin","w")
for e in arr
	write(fd,e)
end
close(fd)