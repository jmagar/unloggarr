import { NextResponse } from 'next/server';
import { getMcpoEndpoint, MCPO_HEADERS } from '@/lib/mcpo';

export async function GET() {
  try {
    console.log('🔔 Fetching notifications from Unraid...');

    // Get notifications overview
    const overviewResponse = await fetch(getMcpoEndpoint('get_notifications_overview'), {
      method: 'POST',
      headers: MCPO_HEADERS
    });

    // Get recent unread notifications
    const notificationsResponse = await fetch(getMcpoEndpoint('list_notifications'), {
      method: 'POST',
      headers: MCPO_HEADERS,
      body: JSON.stringify({
        type: 'UNREAD',
        offset: 0,
        limit: 10
      })
    });

    const [overviewData, notificationsData] = await Promise.all([
      overviewResponse.json(),
      notificationsResponse.json()
    ]);

    console.log('📊 Notifications overview:', JSON.stringify(overviewData, null, 2));
    console.log('📔 Recent notifications:', JSON.stringify(notificationsData, null, 2));

    // Check if MCP server returned errors and provide fallback data
    const hasOverviewError = !overviewResponse.ok || (overviewData && overviewData.detail && overviewData.detail.message === "Unexpected error");
    const hasNotificationsError = !notificationsResponse.ok || (notificationsData && notificationsData.detail && notificationsData.detail.message === "Unexpected error");

    if (hasOverviewError || hasNotificationsError) {
      console.warn('⚠️ MCP server errors detected, providing fallback data');
      return NextResponse.json({
        success: true,
        overview: hasOverviewError ? { unread: { total: 0 }, archive: { total: 0 } } : overviewData,
        notifications: hasNotificationsError ? [] : notificationsData,
        warning: 'MCP server error - using fallback data'
      });
    }

    return NextResponse.json({
      success: true,
      overview: overviewData,
      notifications: notificationsData
    });
  } catch (error) {
    console.error('💥 Error in notifications API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch notifications',
        overview: { unread: { total: 0 } },
        notifications: []
      },
      { status: 500 }
    );
  }
} 