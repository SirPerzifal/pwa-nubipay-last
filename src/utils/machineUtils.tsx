export const convertMachineStatus = (
    statusDryer: string, 
    statusWasher: string
  ) => {
    if (statusDryer === 'bussy' || statusWasher === 'bussy') {
      return 'digunakan';
    }
    return 'tersedia';
  };
  
  export const calculateMachinePrice = (machineType: string): number => {
    switch (machineType.toLowerCase()) {
      case 'sw': return 10000; // Single Washer
      case 'wd': return 15000; // Washer Dryer
      case 'tumbler': return 20000; // Tumbler
      default: return 10000; // Default harga
    }
  };
  
  export const fetchMachines = async () => {
    try {
      const requestBody = new URLSearchParams({
        token: '9s8UXnLBoJqOyiB2',
        username: 'operasabun',
        branch_name: 'sei panas'
      });
  
      const response = await fetch(
        '/api/get/public_link_data', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: requestBody
        }
      );
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      return data.datas[0].providers || [];
    } catch (error) {
      console.error("Error fetching machines:", error);
      return [];
    }
  };