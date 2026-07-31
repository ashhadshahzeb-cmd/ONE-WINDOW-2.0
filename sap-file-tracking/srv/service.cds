using kwsb.filetracking as db from '../db/schema';

service FileTrackingService {
  entity FileTrackingRecords as projection on db.FileTrackingRecords;
  entity FileTimelines as projection on db.FileTimelines;
  entity PendingFiles as projection on db.PendingFiles;
}
