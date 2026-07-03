import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  let allRecords = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('file_tracking_records')
      .select('id, cfo_diary_number, receiving_number, history, created_at, print_date, inward_date')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching:", error);
      break;
    }
    if (!data || data.length === 0) {
      break;
    }
    allRecords = allRecords.concat(data);
    if (data.length < pageSize) break;
    page++;
  }

  console.log(`Total records in DB: ${allRecords.length}`);
  
  const recordsWithHistoryActions = [];
  allRecords.forEach(r => {
    if (r.history && r.history.length > 0) {
      r.history.forEach(h => {
        if (!recordsWithHistoryActions.includes(h.action)) {
          recordsWithHistoryActions.push(h.action);
        }
      });
    }
  });
  console.log("All unique history action types in DB:", recordsWithHistoryActions);

  // Check how many have print_date != created_at (only checking date portion YYYY-MM-DD)
  const differentDates = allRecords.filter(r => {
    if (!r.print_date || !r.created_at) return false;
    const printDateStr = r.print_date; // e.g. "2026-06-23" or whatever format
    const createdDateStr = r.created_at.split('T')[0];
    return printDateStr !== createdDateStr;
  });

  console.log(`Records with print_date != created_at date: ${differentDates.length}`);
  if (differentDates.length > 0) {
    console.log("Sample of records with different dates:");
    differentDates.slice(0, 10).forEach(r => {
      console.log(`Diary: ${r.cfo_diary_number}, Code: ${r.receiving_number}, Created: ${r.created_at}, Print: ${r.print_date}`);
    });
  }

  // Check how many have print_date != inward_date
  const diffInward = allRecords.filter(r => {
    if (!r.print_date || !r.inward_date) return false;
    return r.print_date !== r.inward_date;
  });
  console.log(`Records with print_date != inward_date: ${diffInward.length}`);
}

main();
