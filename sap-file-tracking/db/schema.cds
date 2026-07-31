namespace kwsb.filetracking;

using { cuid, managed } from '@sap/cds/common';

entity FileTrackingRecords : cuid, managed {
  tracking_id : String(50) @title: 'Tracking ID';
  cfo_diary_number : String(50) @title: 'CFO Diary Number';
  receiving_number : String(50) @title: 'Receiving Number';
  subject : String(255) @title: 'Subject';
  amount : Decimal(15,2) @title: 'Amount';
  budget_code : String(100) @title: 'Budget Code';
  status : String(50) default 'Received' @title: 'Status';
  timeline : Composition of many FileTimelines on timeline.file_record = $self;
}

entity FileTimelines : cuid, managed {
  file_record : Association to FileTrackingRecords;
  department : String(100) @title: 'Department';
  action : String(100) @title: 'Action';
  comments : String(1000) @title: 'Comments';
  action_by : String(100) @title: 'Action By';
}

entity PendingFiles : cuid, managed {
  tracking_code : String(50) @title: 'Tracking Code';
  category : String(100) @title: 'Category';
  subject : String(255) @title: 'Subject';
  file_image : String(1000) @title: 'File Image URL';
  status : String(50) default 'pending' @title: 'Status';
}
