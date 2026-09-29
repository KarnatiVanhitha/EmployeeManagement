import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-exams',
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent {
  constructor(private toastService: ToastService) {}
  selectedClass = '';
  selectedSection = '';
  
  classError = '';
  sectionError = '';

  showExamTable = false;

  examSchedule: any[] = [];

  selectedExam: any = null;

allExams: any = {

  '9-A': [

    {
      exam: 'Unit Test 1',startDate:'10-Jun-2026',endDate:'14-Jun-2026',
      subjects: [
        { subject: 'Maths', date: '10-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Jun-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 2',startDate:'20-Jul-2026',endDate:'24-Jul-2026',
      subjects: [
        { subject: 'Maths', date: '20-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '21-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '22-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '23-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '24-Jul-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Quarterly Exam',startDate:'05-Sep-2026',endDate:'09-Sep-2026',
      subjects: [
        { subject: 'Maths', date: '05-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '06-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '07-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '08-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '09-Sep-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 3',startDate:'20-Oct-2026',endDate:'24-Oct-2026',
      subjects: [
        { subject: 'Maths', date: '20-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '21-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '22-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '23-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '24-Oct-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Half Yearly Exam',startDate:'10-Dec-2026',endDate:'14-Dec-2026',
      subjects: [
        { subject: 'Maths', date: '10-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Dec-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Pre Final Exam',startDate:'10-Feb-2027',endDate:'14-Feb-2027',
      subjects: [
        { subject: 'Maths', date: '10-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Feb-2027', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Annual Exam',startDate:'10-Apr-2027',endDate:'14-Apr-2027',
      subjects: [
        { subject: 'Maths', date: '10-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Apr-2027', time: '09:00 AM - 12:00 PM' }
      ]
    }

  ],

  '9-B': [

    {
      exam: 'Unit Test 1',startDate:'10-Jun-2026',endDate:'14-Jun-2026',
      subjects: [
        { subject: 'Maths', date: '10-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Jun-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 2',startDate:'20-Jul-2026',endDate:'24-Jul-2026',
      subjects: [
        { subject: 'Maths', date: '20-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '21-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '22-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '23-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '24-Jul-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Quarterly Exam',startDate:'05-Sep-2026',endDate:'09-Sep-2026',
      subjects: [
        { subject: 'Maths', date: '05-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '06-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '07-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '08-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '09-Sep-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 3',startDate:'20-Oct-2026',endDate:'24-Oct-2026',
      subjects: [
        { subject: 'Maths', date: '20-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '21-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '22-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '23-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '24-Oct-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Half Yearly Exam',startDate:'10-Dec-2026',endDate:'14-Dec-2026',
      subjects: [
        { subject: 'Maths', date: '10-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Dec-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Pre Final Exam',startDate:'10-Feb-2027',endDate:'14-Feb-2027',
      subjects: [
        { subject: 'Maths', date: '10-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Feb-2027', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Annual Exam',startDate:'10-Apr-2027',endDate:'14-Apr-2027',
      subjects: [
        { subject: 'Maths', date: '10-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Science', date: '11-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '12-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Social', date: '13-Apr-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Hindi', date: '14-Apr-2027', time: '09:00 AM - 12:00 PM' }
      ]
    }

  ],

 '10-A': [

    {
      exam: 'Unit Test 1',startDate:'10-Jun-2026',endDate:'14-Jun-2026',
      subjects: [
        { subject: 'Maths', date: '10-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '11-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '12-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '13-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '14-Jun-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 2',startDate:'20-Jul-2026',endDate:'24-Jul-2026',
      subjects: [
        { subject: 'Maths', date: '20-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '21-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '22-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '23-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '24-Jul-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Quarterly Exam',startDate:'05-Sep-2026',endDate:'09-Sep-2026',
      subjects: [
        { subject: 'Maths', date: '05-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '06-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '07-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '08-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '09-Sep-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 3',startDate:'20-Oct-2026',endDate:'24-Oct-2026',
      subjects: [
        { subject: 'Maths', date: '20-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '21-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '22-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '23-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '24-Oct-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Half Yearly Exam',startDate:'10-Dec-2026',endDate:'14-Dec-2026',
      subjects: [
        { subject: 'Maths', date: '10-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '11-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '12-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '13-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '14-Dec-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Pre Board Exam',startDate:'05-Feb-2027',endDate:'09-Feb-2027',
      subjects: [
        { subject: 'Maths', date: '05-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '06-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '07-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '08-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Computer Science', date: '09-Feb-2027', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'SSC Final Exam',startDate:'15-Mar-2027',endDate:'19-Mar-2027',
      subjects: [
        { subject: 'Maths', date: '15-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '16-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '17-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '18-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Computer Science', date: '19-Mar-2027', time: '09:00 AM - 12:00 PM' }
      ]
    }

  ],
  '10-B': [

    {
      exam: 'Unit Test 1',
      subjects: [
        { subject: 'Maths', date: '10-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '11-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '12-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '13-Jun-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '14-Jun-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 2',
      subjects: [
        { subject: 'Maths', date: '20-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '21-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '22-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '23-Jul-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '24-Jul-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Quarterly Exam',
      subjects: [
        { subject: 'Maths', date: '05-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '06-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '07-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '08-Sep-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '09-Sep-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Unit Test 3',
      subjects: [
        { subject: 'Maths', date: '20-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '21-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '22-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '23-Oct-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '24-Oct-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Half Yearly Exam',
      subjects: [
        { subject: 'Maths', date: '10-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '11-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '12-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '13-Dec-2026', time: '09:00 AM - 12:00 PM' },
        { subject: 'Biology', date: '14-Dec-2026', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'Pre Board Exam',
      subjects: [
        { subject: 'Maths', date: '05-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '06-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '07-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '08-Feb-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Computer Science', date: '09-Feb-2027', time: '09:00 AM - 12:00 PM' }
      ]
    },

    {
      exam: 'SSC Final Exam',
      subjects: [
        { subject: 'Maths', date: '15-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Physics', date: '16-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Chemistry', date: '17-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'English', date: '18-Mar-2027', time: '09:00 AM - 12:00 PM' },
        { subject: 'Computer Science', date: '19-Mar-2027', time: '09:00 AM - 12:00 PM' }
      ]
    }

  ],
}

  viewExams() {
    this.classError = '';
    this.sectionError = '';
    let hasError = false;

    if (!this.selectedClass) {
      this.classError = 'Please select Class';
      hasError = true;
    }
    if (!this.selectedSection) {
      this.sectionError = 'Please select Section';
      hasError = true;
    }

    if (hasError) {
      this.toastService.showError('Please select Class and Section');
      return;
    }

    const key =
      `${this.selectedClass}-${this.selectedSection}`;

    this.examSchedule =
      this.allExams[key] || [];

    this.showExamTable = true;

    this.selectedExam = null;

  }

  viewDetails(exam: any) {

    this.selectedExam = exam;

  }
}
