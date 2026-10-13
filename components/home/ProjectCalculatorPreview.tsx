'use client';

import Link from 'next/link';
import { Fence, House, MoveRight, Ruler, Warehouse } from 'lucide-react';
import { useState } from 'react';
import styles from './ProjectCalculatorPreview.module.css';

const projects = [
  { id: 'roof', label: 'Дах', Icon: House },
  { id: 'fence', label: 'Огорожа', Icon: Fence },
  { id: 'facade', label: 'Фасад', Icon: Warehouse },
];

export function ProjectCalculatorPreview() {
  const [project, setProject] = useState('roof');
  const [length, setLength] = useState('12');
  const [width, setWidth] = useState('8');
  const [planes, setPlanes] = useState('2');
  const area = Math.round((Number(length) || 0) * (Number(width) || 0) * (project === 'roof' ? Number(planes) : 1));
  const changeProject = (nextProject: string) => {
    setProject(nextProject);
    if (nextProject === 'fence') { setLength('20'); setWidth('1.8'); setPlanes('1'); }
    else if (nextProject === 'facade') { setLength('10'); setWidth('3'); setPlanes('1'); }
    else { setLength('12'); setWidth('8'); setPlanes('2'); }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}><span><i /> ШВИДКИЙ РОЗРАХУНОК</span></div>
      <p className={styles.question}>Що плануєте облаштувати?</p>
      <div className={styles.projectTypes} role="group" aria-label="Тип проєкту">
        {projects.map(({ id, label, Icon }) => <button key={id} type="button" className={project === id ? styles.selected : ''} onClick={() => changeProject(id)} aria-pressed={project === id}><Icon size={18} /><span>{label}</span></button>)}
      </div>
      <div className={styles.fields}>
        <label><span>{project === 'fence' ? 'Довжина огорожі' : project === 'facade' ? 'Довжина фасаду' : 'Довжина ската'}</span><div><input value={length} onChange={(event) => setLength(event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))} inputMode="decimal" aria-label="Довжина в метрах" /><small>м</small></div></label>
        <label><span>{project === 'fence' ? 'Висота огорожі' : project === 'facade' ? 'Висота фасаду' : 'Ширина ската'}</span><div><input value={width} onChange={(event) => setWidth(event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))} inputMode="decimal" aria-label="Ширина або висота в метрах" /><small>м</small></div></label>
      </div>
      {project === 'roof' && <label className={styles.planes}><span>Кількість однакових скатів</span><select value={planes} onChange={(event) => setPlanes(event.target.value)}><option value="1">Один скат</option><option value="2">Два скати</option><option value="4">Чотири скати</option></select></label>}
      <div className={styles.area}><span><Ruler size={15} /> Орієнтовна площа</span><b>{area} <small>м²</small></b></div>
      <Link className={styles.continue} href={`/calculator?type=${project}&length=${encodeURIComponent(length)}&width=${encodeURIComponent(width)}&planes=${project === 'roof' ? planes : '1'}`}><span>Продовжити розрахунок</span><MoveRight size={18} /></Link>
      <p className={styles.hint}>Безкоштовно · без зобов’язань · точний прорахунок у калькуляторі</p>
    </div>
  );
}
