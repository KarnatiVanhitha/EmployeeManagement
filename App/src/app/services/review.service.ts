import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private apiUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) { }

  getReviews() {
    return this.http.get(this.apiUrl);
  }

  getReviewById(reviewId: number) {
    return this.http.get(`${this.apiUrl}/${reviewId}`);
  }

  getReviewsByReviewee(revieweeId: number) {
    return this.http.get(`${this.apiUrl}/reviewee/${revieweeId}`);
  }

  getReviewsByReviewer(reviewerId: number) {
    return this.http.get(`${this.apiUrl}/reviewer/${reviewerId}`);
  }

  addReview(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateReview(reviewId: number, data: any) {
    return this.http.put(`${this.apiUrl}/${reviewId}`, data);
  }

  deleteReview(reviewId: number) {
    return this.http.delete(`${this.apiUrl}/${reviewId}`);
  }
}
