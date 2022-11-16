from PyPDF2 import PdfReader

reader = PdfReader('project/parsedata/united-states-2018.pdf')
number_of_pages = len(reader.pages)
page = reader.pages[0]
text = page.extract_text()
print(text)
