namespace Backend.DTOs;

// Raporti ashtu siç e sheh një qytetar tjetër: pa emrin e raportuesit, pa fotot dhe me përshkrim të shkurtuar,
// që të mos dalin të dhëna personale që dikush mund t'i ketë shkruar te teksti.
public class CommunityReportDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public int VoteCount { get; set; }

    // A e ka mbështetur qytetari i loguar këtë raport.
    public bool HasVoted { get; set; }

    // A është raporti i qytetarit të loguar (nuk voton të vetin).
    public bool IsMine { get; set; }
}

public class CommunityPageDto
{
    public List<CommunityReportDto> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}

// Përgjigja e votimit: numri i ri dhe gjendja e qytetarit, që frontend-i të përditësohet pa e rilexuar listën.
public class VoteResultDto
{
    public int VoteCount { get; set; }
    public bool HasVoted { get; set; }
}
