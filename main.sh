clear;

# theboys: Make it so that it writes to a new log file every day or something

# rohil: whatever that means, ok

# xh: So... if I might  ask, what did you implement?

# xh: like seriously, I can't figure it out, and it's no-longer a problem, since I got files to work properly now

# xh: Refractoring **everything** rn 9/27/2020

# xh: Done; spend almost all day on it, anyone wanna try out the dynamic page threading I just setup? Literally spent 16 hours on it :)

# theboys: nice good stuff

deno run \
	--unstable \
	--lock='./package.json' \
	--config='./tsconfig.json' \
	--lock-write \
	--allow-all \
	'./server.ts';