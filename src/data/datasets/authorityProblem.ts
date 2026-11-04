import { Dataset } from '../../types';

export const authorityProblemDataset: Dataset = {
  id: 'authority-problem',
  name: 'Scenario 2: Authority vs Topical Relevance',
  description:
    'A university homepage accumulates enormous link authority because every department links to it, yet a focused cancer research article answers the query far better. This scenario isolates the authority problem in early link-based ranking.',
  scenario: 'authority-problem',
  defaultQuery: 'cancer research',
  testQueries: ['cancer research', 'targeted therapy', 'oncology laboratory', 'university news'],
  keyPageIds: ['ap-university-home', 'ap-cancer-article'],
  educationalNotes:
    'Keyword ranking places the targeted-therapy article first. PageRank promotes the university homepage because the entire site links to it, demonstrating why link authority alone can bury the most relevant document.',
  pages: [
    {
      id: 'ap-university-home',
      url: 'https://www.northfield-university.edu/',
      title: 'Northfield University: Research, Teaching, and Campus Life',
      headings: ['Welcome to Northfield University', 'Academic Programs', 'Research Across Disciplines'],
      metaDescription:
        'Official homepage for Northfield University students, faculty, alumni, and prospective applicants.',
      content:
        'Northfield University is a comprehensive research institution serving more than eighteen thousand students. Explore undergraduate and graduate programs, campus news, library resources, athletics, and alumni services. Our faculty conduct funded research across medicine, engineering, humanities, and the social sciences. Prospective students can schedule a campus visit or begin an application online.',
      category: 'University / Homepage',
      links: [
        'ap-cancer-article',
        'ap-research-news',
        'ap-library',
        'ap-oncology-lab',
        'ap-alumni',
        'ap-directory',
        'ap-athletics',
      ],
      educationalRole: 'Site-wide authority hub with many incoming links but weak topical specificity.',
    },
    {
      id: 'ap-cancer-article',
      url: 'https://www.northfield-university.edu/medicine/cancer-research-targeted-therapy',
      title: 'Cancer Research: How Targeted Therapy Is Changing Treatment',
      headings: [
        'Cancer Research Enters the Targeted Therapy Era',
        'How Precision Oncology Selects Treatments',
        'Clinical Trials and Patient Outcomes',
      ],
      metaDescription:
        'A detailed review of cancer research into targeted therapy, precision oncology, biomarkers, and clinical trial outcomes.',
      content:
        'Modern cancer research increasingly focuses on targeted therapy rather than broad chemotherapy. Precision oncology analyzes tumor biomarkers to select drugs that interrupt specific molecular pathways. This cancer research review explains how clinicians match patients to clinical trials, how resistance emerges, and why combination therapy often produces durable responses. The article summarizes peer-reviewed oncology evidence and links to the university laboratory conducting the underlying experiments.',
      category: 'Medicine / Research Article',
      links: ['ap-oncology-lab', 'ap-library', 'ap-university-home'],
      educationalRole: 'Highly relevant, topically focused article with comparatively few inbound links.',
    },
    {
      id: 'ap-research-news',
      url: 'https://www.northfield-university.edu/news/cancer-research-consortium-grant',
      title: 'University News: Cancer Research Consortium Receives Major Grant',
      headings: ['Cancer Research Consortium Award', 'Faculty Collaboration', 'Community Impact'],
      metaDescription:
        'Northfield University announces a multi-year grant supporting collaborative cancer research and clinical trials.',
      content:
        'The Northfield cancer research consortium has received a multi-year grant to expand precision oncology trials. The award supports collaborative work between the oncology laboratory, the medical school, and regional hospitals. Researchers will study biomarkers, treatment resistance, and patient outcomes while training the next generation of clinical scientists.',
      category: 'University / News',
      links: ['ap-cancer-article', 'ap-university-home', 'ap-oncology-lab'],
      educationalRole: 'News page that links to the deep article but also reinforces the homepage authority.',
    },
    {
      id: 'ap-library',
      url: 'https://www.northfield-university.edu/library/research-databases',
      title: 'University Library: Research Databases and Journals',
      headings: ['Research Databases', 'Oncology and Biomedical Journals', 'Citation Management'],
      metaDescription:
        'Access biomedical databases, oncology journals, citation managers, and research support from the university library.',
      content:
        'The university library provides access to biomedical databases, oncology journals, systematic review tools, and citation management software. Subject librarians support cancer research teams with literature searches, data management plans, and open-access publishing guidance.',
      category: 'University / Library',
      links: ['ap-cancer-article', 'ap-university-home', 'ap-directory'],
      educationalRole: 'Supporting hub that links both to the authority homepage and the relevant article.',
    },
    {
      id: 'ap-oncology-lab',
      url: 'https://www.northfield-university.edu/medicine/oncology-laboratory',
      title: 'Oncology Laboratory: Precision Cancer Research',
      headings: ['Laboratory Overview', 'Active Cancer Research Projects', 'Translational Oncology'],
      metaDescription:
        'The Northfield oncology laboratory studies tumor biology, biomarkers, and precision cancer therapies.',
      content:
        'The oncology laboratory investigates tumor genetics, biomarker discovery, and resistance to targeted therapy. Current cancer research projects span lung, breast, and colorectal malignancies. The laboratory collaborates with clinical teams to translate findings into early-phase trials.',
      category: 'Medicine / Laboratory',
      links: ['ap-cancer-article', 'ap-university-home', 'ap-research-news'],
      educationalRole: 'Topical laboratory page that reinforces the deep article with editorial links.',
    },
    {
      id: 'ap-alumni',
      url: 'https://www.northfield-university.edu/alumni',
      title: 'Northfield Alumni Association',
      headings: ['Alumni Community', 'Giving and Volunteering', 'Events'],
      metaDescription:
        'Connect with Northfield University alumni, events, volunteer programs, and giving opportunities.',
      content:
        'The alumni association connects graduates around the world through regional chapters, mentoring, and annual events. Alumni support scholarships, research funds, and campus facilities. Update your contact details to receive invitations and university news.',
      category: 'University / Alumni',
      links: ['ap-university-home', 'ap-athletics'],
      educationalRole: 'Peripheral page that contributes an inbound link to the authority homepage.',
    },
    {
      id: 'ap-directory',
      url: 'https://www.northfield-university.edu/directory',
      title: 'Campus Directory and Department Contacts',
      headings: ['Department Directory', 'Administrative Offices', 'Campus Map'],
      metaDescription:
        'Find Northfield University departments, administrative offices, phone numbers, and campus locations.',
      content:
        'Use the campus directory to reach academic departments, administrative offices, information technology support, and the library. The directory includes building locations, office hours, and accessibility information.',
      category: 'University / Directory',
      links: ['ap-university-home', 'ap-library'],
      educationalRole: 'Navigational page that adds another inbound link to the homepage.',
    },
    {
      id: 'ap-athletics',
      url: 'https://www.northfield-university.edu/athletics',
      title: 'Northfield Athletics: Teams, Schedules, and Tickets',
      headings: ['Varsity Teams', 'Game Schedules', 'Recreation Facilities'],
      metaDescription:
        'Follow Northfield University athletics with schedules, results, tickets, and recreation facilities.',
      content:
        'Northfield athletics supports varsity teams, club sports, and campus recreation. View schedules, purchase tickets, reserve fitness facilities, and follow student-athlete achievements throughout the season.',
      category: 'University / Athletics',
      links: ['ap-university-home', 'ap-alumni'],
      educationalRole: 'Unrelated but legitimate page that strengthens the homepage authority signal.',
    },
  ],
};
