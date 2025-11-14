using backend.DTOs.Admin;

public interface IAdminService
{
    Task<DashboardDto> GetDashboardAsync();
}
