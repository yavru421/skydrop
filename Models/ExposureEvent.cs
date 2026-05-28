namespace BlazorPwaTemplate.Models;

/// <summary>
/// Represents a single noise exposure event captured by DeciBell Guard.
/// </summary>
public record ExposureEvent
{
    public string Id { get; init; } = Guid.NewGuid().ToString("N");
    public DateTime Timestamp { get; init; } = DateTime.Now;
    public double PeakDb { get; init; }
    public int DurationSeconds { get; init; }

    /// <summary>
    /// Base64-encoded audio data URI (e.g. "data:audio/webm;base64,...")
    /// </summary>
    public string AudioDataUri { get; init; } = string.Empty;

    /// <summary>
    /// User-editable note added after review.
    /// </summary>
    public string Notes { get; set; } = string.Empty;

    public string TimestampFormatted => Timestamp.ToString("MMM d, h:mm tt");
    public string PeakDbFormatted => $"{PeakDb:F1} dB";
}
