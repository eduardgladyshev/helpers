Install:

```npm install```

Usage: 

```
  npm run addSchedule -- [options]  add schedule
  npm run genSpls -- [options]      add schedule and generate spls
```

Example:

```node schedule.js -d 7 -t 12:00 -p dolby```

Options:

```
  -d, --days            Count days, from tody.  Default - '1'.
  -t, --time-start      Seance time start. Default - '10:00'.
  -c, --count-seances   Count seances for day. Default - '1'.
  -p, --playservers     Set hall with playservers: 'doremi','dolby'(pro7),'christie'(pro1339). Default - doremi.
  -o, --ofset           Set schedule ofset.
  -e, --env             Set 'stage' enviroment.
```
