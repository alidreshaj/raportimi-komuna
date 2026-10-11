namespace Backend.Services;

// Rezultati i një veprimi mbi raport (ndryshim ose fshirje).
// Service-i e kthen, dhe controller-i e kthen në kodin e duhur HTTP.
public enum ReportActionResult
{
    Success,         // u krye
    NotFound,        // raporti nuk ekziston ose nuk është i këtij përdoruesi → 404
    NotEditable,     // statusi nuk është New → 409
    InvalidCategory, // kategoria e re nuk ekziston → 400
    InvalidTransition // kalimi i statusit nuk lejohet (p.sh. nga Resolved) → 409
}
