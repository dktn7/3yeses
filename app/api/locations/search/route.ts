export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Use Nominatim OpenStreetMap API for location search
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '10',
      'accept-language': 'en',
    });

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': '3YESES-Talent-Platform/1.0',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Nominatim');
    }

    const results = await response.json();

    // Format the results to a simpler structure
    const formattedResults = results.map((result: any) => {
      const address = result.address || {};
      let displayName = '';

      // Build a clean display name from components
      if (address.city || address.town || address.village) {
        displayName = address.city || address.town || address.village;
      } else if (address.county) {
        displayName = address.county;
      } else if (address.state) {
        displayName = address.state;
      }

      // Add country
      if (address.country) {
        displayName = displayName ? `${displayName}, ${address.country}` : address.country;
      }

      // Fallback to display_name if we couldn't build a good one
      if (!displayName) {
        displayName = result.display_name;
      }

      return {
        id: result.place_id,
        displayName: displayName,
        fullName: result.display_name,
        lat: result.lat,
        lon: result.lon,
        type: result.type,
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        country: address.country || '',
        countryCode: address.country_code || '',
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedResults,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch locations',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
