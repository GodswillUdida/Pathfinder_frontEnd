// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useApplicant, useUpdateApplicantStatus, useDeleteApplicant } from "@/hooks/useApplicants";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";

// interface ApplicantDetailPageProps {
//   params: { id: string };
// }

// const STATUS_COLORS: Record<string, string> = {
//   PENDING: "bg-yellow-100 text-yellow-800",
//   APPROVED: "bg-green-100 text-green-800",
//   REJECTED: "bg-red-100 text-red-800",
// };

// const STATUS_OPTIONS = ["PENDING", "APPROVED", "REJECTED"];

// export default function ApplicantDetailPage({ params }: ApplicantDetailPageProps) {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [newStatus, setNewStatus] = useState<string>("");

//   const { data: applicant, isLoading } = useApplicant(params.id);
//   const updateStatus = useUpdateApplicantStatus();
//   const deleteApplicant = useDeleteApplicant();

//   const handleStatusUpdate = async (status: string) => {
//     if (status === applicant?.status) return;
//     setNewStatus(status);
//     await updateStatus.mutateAsync({ id: params.id, status });
//   };

//   const handleDelete = async () => {
//     await deleteApplicant.mutateAsync(params.id);
//     router.push("/applicants");
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Loader2 className="h-32 w-32 animate-spin text-muted-foreground" />
//       </div>
//     );
//   }

//   if (!applicant) {
//     return (
//       <div className="space-y-24">
//         <Link href="/applicants">
//           <Button variant="ghost" size="sm">
//             <ArrowLeft className="mr-8 h-16 w-16" />
//             Back to Applicants
//           </Button>
//         </Link>
//         <Card>
//           <CardContent className="pt-32">
//             <p className="text-center text-muted-foreground">Applicant not found</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-24">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-16">
//           <Link href="/applicants">
//             <Button variant="ghost" size="sm">
//               <ArrowLeft className="mr-8 h-16 w-16" />
//               Back
//             </Button>
//           </Link>
//           <div>
//             <h1 className="text-32 font-bold">{applicant.fullName}</h1>
//             <p className="text-muted-foreground mt-4">{applicant.email}</p>
//           </div>
//         </div>
//         <Button
//           variant="destructive"
//           size="sm"
//           onClick={() => setShowDeleteDialog(true)}
//           disabled={deleteApplicant.isPending}
//         >
//           {deleteApplicant.isPending ? (
//             <Loader2 className="mr-8 h-16 w-16 animate-spin" />
//           ) : (
//             <Trash2 className="mr-8 h-16 w-16" />
//           )}
//           Delete
//         </Button>
//       </div>

//       {/* Status Section */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Application Status</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-16">
//           <div className="flex items-center gap-16">
//             <div className="flex-1">
//               <p className="text-sm text-muted-foreground mb-8">Current Status</p>
//               <Badge className={`${STATUS_COLORS[applicant.status] || "bg-gray-100"}`}>
//                 {applicant.status}
//               </Badge>
//             </div>
//             <div className="flex-1">
//               <p className="text-sm text-muted-foreground mb-8">Update Status</p>
//               <Select
//                 value={newStatus || applicant.status}
//                 onValueChange={handleStatusUpdate}
//                 disabled={updateStatus.isPending}
//               >
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {STATUS_OPTIONS.map((status) => (
//                     <SelectItem key={status} value={status}>
//                       {status}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Basic Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Basic Information</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-24 md:grid-cols-2">
//             <div>
//               <p className="text-sm text-muted-foreground">Full Name</p>
//               <p className="font-medium mt-4">{applicant.fullName}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Email</p>
//               <p className="font-medium mt-4">{applicant.email}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Phone</p>
//               <p className="font-medium mt-4">{applicant.phone}</p>
//             </div>
//             <div>
//               <p className="text-sm text-muted-foreground">Address</p>
//               <p className="font-medium mt-4">{applicant.address}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Education Details */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Education Details</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-24 md:grid-cols-2">
//             {applicant.lectureCenter && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Current Lecture Center</p>
//                 <p className="font-medium mt-4">{applicant.lectureCenter}</p>
//               </div>
//             )}
//             {applicant.previousCenter && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Previous Lecture Center</p>
//                 <p className="font-medium mt-4">{applicant.previousCenter}</p>
//               </div>
//             )}
//             {applicant.level && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Level</p>
//                 <p className="font-medium mt-4">{applicant.level}</p>
//               </div>
//             )}
//             <div>
//               <p className="text-sm text-muted-foreground">Student Status</p>
//               <p className="font-medium mt-4">
//                 {applicant.isNewStudent ? "New Student" : "Returning Student"}
//               </p>
//             </div>
//           </div>

//           {applicant.papers && applicant.papers.length > 0 && (
//             <div className="mt-24">
//               <p className="text-sm text-muted-foreground mb-12">Papers</p>
//               <div className="flex flex-wrap gap-8">
//                 {applicant.papers.map((paper) => (
//                   <Badge key={paper} variant="secondary">
//                     {paper}
//                   </Badge>
//                 ))}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Additional Information */}
//       {(applicant.careerChallenges || applicant.referredBy) && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Additional Information</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-24">
//             {applicant.careerChallenges && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Career Challenges</p>
//                 <p className="mt-4">{applicant.careerChallenges}</p>
//               </div>
//             )}
//             {applicant.referredBy && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Referred By</p>
//                 <p className="font-medium mt-4">{applicant.referredBy}</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Employment Information */}
//       {applicant.employment && (applicant.employment.placeOfWork || applicant.employment.position) && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Employment Information</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-24 md:grid-cols-2">
//               {applicant.employment.placeOfWork && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Place of Work</p>
//                   <p className="font-medium mt-4">{applicant.employment.placeOfWork}</p>
//                 </div>
//               )}
//               {applicant.employment.position && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Position</p>
//                   <p className="font-medium mt-4">{applicant.employment.position}</p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Sponsor Information */}
//       {applicant.sponsor && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Sponsor Information</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-24 md:grid-cols-2">
//               {applicant.sponsor.name && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Name</p>
//                   <p className="font-medium mt-4">{applicant.sponsor.name}</p>
//                 </div>
//               )}
//               {applicant.sponsor.phone && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Phone</p>
//                   <p className="font-medium mt-4">{applicant.sponsor.phone}</p>
//                 </div>
//               )}
//               {applicant.sponsor.email && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Email</p>
//                   <p className="font-medium mt-4">{applicant.sponsor.email}</p>
//                 </div>
//               )}
//               {applicant.sponsor.location && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Location</p>
//                   <p className="font-medium mt-4">{applicant.sponsor.location}</p>
//                 </div>
//               )}
//               {applicant.sponsor.workplace && (
//                 <div>
//                   <p className="text-sm text-muted-foreground">Workplace</p>
//                   <p className="font-medium mt-4">{applicant.sponsor.workplace}</p>
//                 </div>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Metadata */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Application Metadata</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-24 md:grid-cols-2">
//             {applicant.createdAt && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Created At</p>
//                 <p className="font-medium mt-4">
//                   {new Date(applicant.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//             )}
//             {applicant.updatedAt && (
//               <div>
//                 <p className="text-sm text-muted-foreground">Updated At</p>
//                 <p className="font-medium mt-4">
//                   {new Date(applicant.updatedAt).toLocaleDateString()}
//                 </p>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Delete Dialog */}
//       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Applicant</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete {applicant.fullName}? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <div className="flex justify-end gap-12">
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDelete}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               disabled={deleteApplicant.isPending}
//             >
//               {deleteApplicant.isPending ? (
//                 <>
//                   <Loader2 className="mr-8 h-16 w-16 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </AlertDialogAction>
//           </div>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }