import fs from 'fs';
import ical from 'ical-generator';
import moment from 'moment';
import fetch from 'node-fetch';
import { exit } from 'process';

const entries = await fetch('https://daten.stadt.sg.ch/explore/dataset/abfuhrdaten-stadt-stgallen/download/?format=json&timezone=Europe/Zurich&lang=de').then(res => res.json());

if (process.argv.length != 4) {
  console.error('Falscher aufruf, siehe Readme.md');
  exit(-1);
}

const filterSammlung = process.argv[3].split(',');
const filterGebiet = process.argv[2].toUpperCase();

console.log('Generiere Abfallkalender ICS für ' + filterSammlung.join(',') + ' in Region ' + filterGebiet);

const filtered = entries
.filter(entry => filterSammlung.includes(entry.fields.sammlung))
.filter(entry => filterGebiet.includes(entry.fields.gebiets_id))
.map(entry => {
  return {
    start: moment(entry.fields.datum),
    allDay: true,
    summary: entry.fields.sammlung,
    description: entry.fields.titel,
    busystatus: 'FREE'
  }
})

fs.writeFileSync('abfallkalender.ics', ical({
  prodId: '//https://github.com/nicam/abfallkalender-sg//EN',
  timezone: 'Europe/Berlin',
  name: 'Abfallkalender St. Gallen',
  events: filtered
}).toString());

console.log("Datei 'abfallkalender.ics' wurde erzeugt");
