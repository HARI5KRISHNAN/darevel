import { FileMetadata, FileType, PreviewStatus, SheetData, SlideData } from '../types';

export const MOCK_FILES: FileMetadata[] = [
  {
    id: '1',
    name: 'Q3_Financial_Report.pdf',
    type: FileType.PDF,
    size: '2.4 MB',
    updatedAt: '2 mins ago',
    status: PreviewStatus.READY,
    owner: 'Alice Chen',
    pageCount: 5,
    textContent:
      'This is the Q3 Financial Report. Revenue is up 20% compared to last quarter. Key drivers include the new product launch in the Asia-Pacific region. Operating expenses have stabilized. Net profit margin stands at 15%. Risks include currency fluctuation.',
  },
  {
    id: '2',
    name: 'Project_Alpha_Specs.docx',
    type: FileType.DOCX,
    size: '845 KB',
    updatedAt: '1 hour ago',
    status: PreviewStatus.READY,
    owner: 'Bob Smith',
    textContent:
      '<h1>Project Alpha Specifications</h1><p>The objective of Project Alpha is to revolutionize our file preview system. <strong>Phase 1</strong> includes PDF and Image support. <strong>Phase 2</strong> adds video streaming.</p><h3>Requirements</h3><ul><li>Low latency</li><li>High availability</li></ul>',
  },
  {
    id: '3',
    name: 'Investor_Deck_Final.pptx',
    type: FileType.PPTX,
    size: '12 MB',
    updatedAt: 'Yesterday',
    status: PreviewStatus.READY,
    owner: 'Carol Williams',
    slideCount: 6,
    textContent:
      'Slide 1: Title. Slide 2: Market Opportunity. Slide 3: Our Solution. Slide 4: Business Model. Slide 5: Go-to-Market Strategy. Slide 6: Team.',
  },
  {
    id: '4',
    name: 'Budget_2024.xlsx',
    type: FileType.XLSX,
    size: '45 KB',
    updatedAt: '2 days ago',
    status: PreviewStatus.READY,
    owner: 'David Miller',
    sheetNames: ['Summary', 'Q1 Detail', 'Q2 Detail'],
    textContent: 'Budget Summary 2024. Total Allocated: $1.2M. Marketing: $400k. Engineering: $600k. Operations: $200k.',
  },
  {
    id: '5',
    name: 'Team_Offsite_Photo.jpg',
    type: FileType.IMAGE,
    size: '3.2 MB',
    updatedAt: 'Last week',
    status: PreviewStatus.READY,
    owner: 'Eve Davis',
    textContent: 'A photo of the engineering team at the annual offsite in Lake Tahoe.',
  },
  {
    id: '6',
    name: 'Feature_Demo.mp4',
    type: FileType.VIDEO,
    size: '45 MB',
    updatedAt: 'Last week',
    status: PreviewStatus.READY,
    owner: 'Frank Wilson',
    duration: '02:14',
    textContent: 'Video demonstration of the new drag-and-drop feature.',
  },
  {
    id: '7',
    name: 'Large_Architecture_Diagram.pdf',
    type: FileType.PDF,
    size: '58 MB',
    updatedAt: '3 weeks ago',
    status: PreviewStatus.READY,
    owner: 'Grace Lee',
    pageCount: 1,
    textContent: 'Detailed system architecture diagram showing microservices interactions.',
  },
  {
    id: '8',
    name: 'Unprocessed_Upload.docx',
    type: FileType.DOCX,
    size: '12 KB',
    updatedAt: 'Just now',
    status: PreviewStatus.PROCESSING,
    owner: 'Harry Potter',
    textContent: '',
  },
  {
    id: '9',
    name: 'Corrupted_File.txt',
    type: FileType.PDF,
    size: '0 KB',
    updatedAt: 'Long ago',
    status: PreviewStatus.FAILED,
    owner: 'System',
    textContent: '',
  },
];

export const getFileDetails = async (fileId: string): Promise<FileMetadata> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const file = MOCK_FILES.find(f => f.id === fileId);
      if (file) resolve(file);
      else reject(new Error('File not found'));
    }, 400);
  });
};

export const getExcelData = async (fileId: string): Promise<SheetData[]> => {
  return [
    {
      name: 'Summary',
      rows: [
        ['Category', 'Budget', 'Spent', 'Remaining'],
        ['Marketing', '$400,000', '$120,000', '$280,000'],
        ['Engineering', '$600,000', '$350,000', '$250,000'],
        ['Operations', '$200,000', '$50,000', '$150,000'],
        ['Total', '$1,200,000', '$520,000', '$680,000'],
      ],
    },
    {
      name: 'Q1 Detail',
      rows: [
        ['Month', 'Item', 'Cost'],
        ['Jan', 'Software Licenses', '$15,000'],
        ['Jan', 'Server Costs', '$8,000'],
        ['Feb', 'Recruiting', '$12,000'],
      ],
    },
  ];
};

export const getSlideData = async (fileId: string): Promise<SlideData[]> => {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: i + 1,
    title: `Slide ${i + 1}: Key Topics`,
    content: `This is the detailed content for slide ${i + 1}. It contains bullet points and charts relevant to the topic.`,
    imageUrl: `https://picsum.photos/800/450?random=${i}`,
  }));
};
