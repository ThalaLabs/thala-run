export const walletAddressEllipsis = (address: string) => {
  if (!address || address.length <= 10) {
    return address;
  }
  return address.slice(0, 6) + "..." + address.slice(-4);
};
