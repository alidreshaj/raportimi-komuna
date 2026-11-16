namespace Backend.Models;

// Pse u krijua një njoftim.
public enum NotificationType
{
    StatusChanged, // admini ndryshoi statusin e raportit → njoftohet qytetari
    NewComment,    // u shtua një koment → njoftohet pala tjetër (qytetari ose adminët)
    NewReport,     // qytetari dërgoi një raport të ri → njoftohen adminët
    ReportSupported // raporti arriti një prag mbështetjesh (5, 10, 25) → njoftohet i zoti
}
