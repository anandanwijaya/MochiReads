
import React from 'react';
import { Book, ReadingProgressRecord } from '../types';
import { Play, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { playSound } from './SoundEffects';

interface ReadingProgressTableProps {
  progressRecords: ReadingProgressRecord[];
  books: Book[];
  onRead: (book: Book) => void;
  theme: 'light' | 'dark';
}

const ReadingProgressTable: React.FC<ReadingProgressTableProps> = ({ progressRecords, books, onRead, theme }) => {
  const isDark = theme === 'dark';

  if (progressRecords.length === 0) {
    return (
      <div className={`text-center py-20 rounded-[3rem] border-4 border-dashed ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
        <Clock size={48} className="mx-auto mb-4 text-slate-300" />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No Reading Progress Yet</h3>
        <p className="text-slate-500">Pick a book from the library to start your adventure!</p>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-hidden rounded-[2.5rem] border-4 ${isDark ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-purple-50 shadow-sm'}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`border-b-4 ${isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-purple-50/50 border-purple-50 text-slate-500'}`}>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Story</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest hidden sm:table-cell">Level</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest">Progress</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest hidden md:table-cell">Last Read</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className={`divide-y-2 ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
          {progressRecords.map((record) => {
            const book = books.find(b => b.id === record.book_id);
            if (!book) return null;

            const percentage = Math.round(((record.current_page + 1) / book.pages.length) * 100);
            const date = new Date(record.last_read_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return (
              <tr key={record.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-purple-50/20'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={book.coverImage} className="w-12 h-16 object-cover rounded-lg shadow-sm" alt={book.title} />
                    <div>
                      <p className={`font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{book.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{book.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                   <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-slate-800 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                     Lvl {book.level}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5 min-w-[120px]">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className={record.is_finished ? 'text-green-500' : (isDark ? 'text-indigo-400' : 'text-indigo-600')}>
                         {record.is_finished ? 'Completed' : `${percentage}%`}
                       </span>
                       <span className="text-slate-400">Page {record.current_page + 1}/{book.pages.length}</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full transition-all duration-700 ${record.is_finished ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                        style={{ width: `${record.is_finished ? 100 : percentage}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <p className="text-xs font-bold text-slate-500">{date}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { playSound('pop'); onRead(book); }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                      record.is_finished 
                        ? (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95'
                    }`}
                  >
                    {record.is_finished ? (
                      <><Play size={14} fill="currentColor" strokeWidth={0} /> Read Again</>
                    ) : (
                      <><Play size={14} fill="currentColor" strokeWidth={0} /> Resume</>
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReadingProgressTable;
