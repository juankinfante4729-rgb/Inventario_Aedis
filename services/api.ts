import { Member, ApiResponse } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbwO-qr8Qf_mLnia1BzbCdqvj9kbmYiK5ee3tcz_FpCVkg0-05L1Jc-57leJPAKlDNxr/exec';

export const fetchMembers = async (): Promise<Member[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Error de red al obtener socios');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
};

export const createMember = async (member: Partial<Member>, fileData?: { data: string; name: string }): Promise<ApiResponse> => {
  try {
    const payload = {
      action: 'create',
      data: {
        ...member,
        fileData: fileData?.data,
        fileName: fileData?.name
      }
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
};

export const syncMembers = async (members: Member[]): Promise<ApiResponse> => {
  try {
    const payload = {
      action: 'sync_all',
      data: members
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error syncing members:', error);
    throw error;
  }
};
