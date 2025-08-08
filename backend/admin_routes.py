from datetime import datetime
from fastapi.responses import StreamingResponse
import csv
import io

# ... keep existing imports and router setup ...

@admin_router.get("/ad-analytics/export")
async def export_ad_analytics_csv(
    from_ts: Optional[str] = Query(None),
    to_ts: Optional[str] = Query(None),
    placement: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    current_admin: AdminUser = Depends(get_current_admin_user),
):
    """Export ad analytics events as CSV with optional filters."""
    database = get_db()
    flt = {}
    if placement:
        flt["placement"] = placement
    if category_id:
        flt["category_id"] = category_id
    if from_ts or to_ts:
        t = {}
        if from_ts:
            t["$gte"] = datetime.fromisoformat(from_ts)
        if to_ts:
            t["$lte"] = datetime.fromisoformat(to_ts)
        flt["created_at"] = t

    cursor = database.ad_analytics.find(flt).sort("created_at", -1)
    rows = await cursor.to_list(length=None)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["created_at", "event_type", "placement", "source", "category_id", "session_id", "metadata"])
    for r in rows:
        writer.writerow([
            r.get("created_at"),
            r.get("event_type"),
            r.get("placement"),
            r.get("source"),
            r.get("category_id"),
            r.get("session_id"),
            r.get("metadata"),
        ])

    output.seek(0)
    headers = {"Content-Disposition": "attachment; filename=ad_analytics.csv"}
    return StreamingResponse(iter([output.read()]), media_type="text/csv", headers=headers)